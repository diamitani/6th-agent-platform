"""
Hermes Runtime — the execution engine of the 6th Agent platform.

The platform is an agent builder that *wraps a Claude Code / Hermes-style
agentic loop* behind the ROSTR runtime. This module is that wrapper:

    PAL manifest ──► HermesRuntime.run() ──► think → act (tool call) → observe
                                             loop until done or max turns

Model providers (first available wins):

    1. AWS Bedrock            platform credits    (Claude via Bedrock, metered)
    2. Anthropic Claude       ANTHROPIC_API_KEY   (BYOK direct)
    3. Open-source Hermes     via Ollama          (e.g. hermes3, deepseek-r1)

Tenant runs are metered: every Bedrock call records token usage and cost,
and deducts platform credits for tenants in credits mode.

Tool execution is delegated to Composio (managed auth for 300+ apps), so any
agent built in the platform can act on Gmail, HubSpot, Slack, GitHub, etc.
Every run persists an execution trace so the Command Center can display live
agent activity, and results can be written to the S3 Reference Hub.
"""

from __future__ import annotations

import json
import os
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Optional

import httpx
from loguru import logger

MAX_TURNS_DEFAULT = 8

TOOL_PROTOCOL = """
You can use tools. To call a tool, reply with ONLY a JSON object on a single line:
{"tool": "<tool_slug>", "arguments": { ... }}

Available tools:
{tool_descriptions}

When you have the final answer (or no tool is needed), reply with:
{"final": "<your complete answer>"}
""".strip()


@dataclass
class AgentRunResult:
    run_id: str
    agent_id: str
    status: str  # completed | failed | max_turns
    output: str
    turns: int
    trace: list[dict] = field(default_factory=list)
    started_at: str = ""
    finished_at: str = ""

    def to_dict(self) -> dict:
        return {
            "run_id": self.run_id,
            "agent_id": self.agent_id,
            "status": self.status,
            "output": self.output,
            "turns": self.turns,
            "trace": self.trace,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
        }


class HermesRuntime:
    """Claude/Hermes agentic loop with Composio tool execution."""

    def __init__(
        self,
        composio_client=None,
        knowledge_store=None,
        bedrock_client=None,
        billing_meter=None,
        anthropic_api_key: Optional[str] = None,
        ollama_host: Optional[str] = None,
        hermes_model: Optional[str] = None,
    ):
        self.composio = composio_client
        self.knowledge_store = knowledge_store
        self.bedrock = bedrock_client
        self.billing = billing_meter
        self.anthropic_api_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
        self.anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
        self.ollama_host = ollama_host or os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.hermes_model = hermes_model or os.getenv("HERMES_MODEL", "hermes3:8b")
        # In-memory run log; the Command Center ops feed reads from here.
        self.runs: dict[str, AgentRunResult] = {}

    @property
    def provider(self) -> str:
        if self.bedrock is not None and self.bedrock.enabled:
            return "bedrock-credits"
        if self.anthropic_api_key:
            return "anthropic"
        return "ollama-hermes"

    # -------------------------------------------------------------- LLM call

    async def _complete(
        self, system: str, messages: list[dict], meter: Optional[dict] = None
    ) -> str:
        if self.bedrock is not None and self.bedrock.enabled:
            return await self._complete_bedrock(system, messages, meter)
        if self.anthropic_api_key:
            return await self._complete_anthropic(system, messages)
        return await self._complete_ollama(system, messages)

    async def _complete_bedrock(
        self, system: str, messages: list[dict], meter: Optional[dict] = None
    ) -> str:
        import asyncio

        completion = await asyncio.to_thread(
            self.bedrock.converse, system=system, messages=messages
        )
        if meter is not None:
            meter["input_tokens"] = meter.get("input_tokens", 0) + completion.input_tokens
            meter["output_tokens"] = meter.get("output_tokens", 0) + completion.output_tokens
            meter["cost_usd"] = round(meter.get("cost_usd", 0.0) + completion.cost_usd, 6)
            meter["model_id"] = completion.model_id
        return completion.text

    async def _complete_anthropic(self, system: str, messages: list[dict]) -> str:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.anthropic_model,
                    "max_tokens": 4096,
                    "system": system,
                    "messages": messages,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return "".join(
                block.get("text", "")
                for block in data.get("content", [])
                if block.get("type") == "text"
            )

    async def _complete_ollama(self, system: str, messages: list[dict]) -> str:
        from rostr.llm.ollama_client import OllamaClient

        ollama = OllamaClient(host=self.ollama_host)
        try:
            chat_messages = [{"role": "system", "content": system}, *messages]
            return await ollama.chat(model=self.hermes_model, messages=chat_messages)
        finally:
            await ollama.close()

    # ----------------------------------------------------------- Agent loop

    async def run(
        self,
        agent_id: str,
        system_prompt: str,
        task: str,
        tools: Optional[list[dict]] = None,
        user_id: str = "default",
        max_turns: int = MAX_TURNS_DEFAULT,
        on_event: Optional[Callable[[dict], Any]] = None,
        tenant_id: Optional[str] = None,
        billing_mode: str = "credits",
    ) -> AgentRunResult:
        """Execute one agent task through the think→act→observe loop.

        ``tools`` is a list of {slug, name, description} entries (typically
        Composio tools attached to the agent at build time). When
        ``tenant_id`` is set, Bedrock token usage is metered and credits
        deducted per the tenant's billing mode.
        """
        run_id = str(uuid.uuid4())
        started = datetime.now(timezone.utc).isoformat()
        trace: list[dict] = []
        tools = tools or []
        meter: dict = {}

        def emit(event: dict):
            event["timestamp"] = datetime.now(timezone.utc).isoformat()
            trace.append(event)
            if on_event:
                try:
                    on_event(event)
                except Exception:
                    pass

        tool_desc = "\n".join(
            f"- {t['slug']}: {t.get('description') or t.get('name', '')}" for t in tools
        ) or "- (no external tools attached)"
        system = (
            f"{system_prompt}\n\n{TOOL_PROTOCOL.replace('{tool_descriptions}', tool_desc)}"
        )
        messages: list[dict] = [{"role": "user", "content": task}]

        emit({"type": "run_started", "agent_id": agent_id, "task": task, "provider": self.provider})

        status, output, turn = "max_turns", "", 0
        for turn in range(1, max_turns + 1):
            try:
                reply = await self._complete(system, messages, meter)
            except Exception as e:
                logger.error(f"Runtime completion failed (run {run_id}): {e}")
                status, output = "failed", f"Model call failed: {e}"
                emit({"type": "error", "detail": str(e)})
                break

            emit({"type": "assistant_turn", "turn": turn, "content": reply[:2000]})
            action = self._parse_action(reply)

            if action is None or "final" in action:
                status = "completed"
                output = (action or {}).get("final", reply)
                emit({"type": "run_completed", "turn": turn})
                break

            tool_slug = action.get("tool", "")
            arguments = action.get("arguments", {})
            emit({"type": "tool_call", "tool": tool_slug, "arguments": arguments})

            observation = await self._execute_tool(tool_slug, arguments, user_id)
            emit({"type": "tool_result", "tool": tool_slug, "result": str(observation)[:2000]})

            messages.append({"role": "assistant", "content": reply})
            messages.append(
                {
                    "role": "user",
                    "content": f"TOOL RESULT ({tool_slug}):\n{json.dumps(observation, default=str)[:6000]}",
                }
            )

        if status == "max_turns":
            output = output or "Run reached the maximum number of turns."
            emit({"type": "run_max_turns", "turns": max_turns})

        # Meter tenant usage (Bedrock credits mode)
        if tenant_id and self.billing is not None and meter.get("cost_usd"):
            billed = self.billing.record_usage(
                tenant_id=tenant_id,
                agent_id=agent_id,
                model_id=meter.get("model_id", ""),
                input_tokens=meter.get("input_tokens", 0),
                output_tokens=meter.get("output_tokens", 0),
                cost_usd=meter["cost_usd"],
                billing_mode=billing_mode,
                run_id=run_id,
            )
            emit({"type": "usage_metered", **{k: v for k, v in meter.items()}, **billed})

        result = AgentRunResult(
            run_id=run_id,
            agent_id=agent_id,
            status=status,
            output=output,
            turns=turn,
            trace=trace,
            started_at=started,
            finished_at=datetime.now(timezone.utc).isoformat(),
        )
        self.runs[run_id] = result
        self._persist_run(result)
        return result

    # -------------------------------------------------------------- Helpers

    @staticmethod
    def _parse_action(reply: str) -> Optional[dict]:
        """Extract the JSON action object from a model reply, if any."""
        candidates = re.findall(r"\{.*\}", reply, flags=re.DOTALL)
        for candidate in candidates:
            try:
                obj = json.loads(candidate)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict) and ("tool" in obj or "final" in obj):
                return obj
        return None

    async def _execute_tool(self, tool_slug: str, arguments: dict, user_id: str) -> dict:
        if not self.composio:
            return {"successful": False, "error": "No tool executor configured"}
        try:
            return await self.composio.execute_tool(
                tool_slug=tool_slug, arguments=arguments, user_id=user_id
            )
        except Exception as e:
            return {"successful": False, "error": str(e)}

    def _persist_run(self, result: AgentRunResult):
        """Write the run trace to the S3 Reference Hub when configured."""
        if not (self.knowledge_store and self.knowledge_store.enabled):
            return
        try:
            self.knowledge_store.put_document(
                namespace="projects",
                scope_id="default",
                filename=f"runs/{result.run_id}.json",
                content=json.dumps(result.to_dict(), default=str).encode("utf-8"),
                content_type="application/json",
            )
        except Exception as e:
            logger.warning(f"Failed to persist run {result.run_id} to hub: {e}")

    def recent_events(self, limit: int = 50) -> list[dict]:
        """Flattened, newest-first event feed across all runs (ops feed)."""
        events: list[dict] = []
        for run in self.runs.values():
            for ev in run.trace:
                events.append({**ev, "run_id": run.run_id, "agent_id": run.agent_id})
        events.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
        return events[:limit]
