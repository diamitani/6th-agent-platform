"""Runtime API — execute agents through the Hermes runtime (Claude/Hermes loop)."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()


def _runtime(request: Request):
    runtime = getattr(request.app.state, "hermes_runtime", None)
    if runtime is None:
        raise HTTPException(503, "Hermes runtime not initialized")
    return runtime


class RunAgentRequest(BaseModel):
    agent_id: str
    system_prompt: str
    task: str
    tools: list[dict] = []  # [{slug, name, description}]
    user_id: str = "default"
    max_turns: int = 8


@router.get("/status")
async def runtime_status(request: Request):
    runtime = _runtime(request)
    return {
        "provider": runtime.provider,
        "anthropic_model": runtime.anthropic_model,
        "hermes_model": runtime.hermes_model,
        "active_runs": len(runtime.runs),
    }


@router.post("/run")
async def run_agent(req: RunAgentRequest, request: Request):
    runtime = _runtime(request)
    try:
        result = await runtime.run(
            agent_id=req.agent_id,
            system_prompt=req.system_prompt,
            task=req.task,
            tools=req.tools,
            user_id=req.user_id,
            max_turns=req.max_turns,
        )
    except Exception as e:
        raise HTTPException(502, f"Agent run failed: {e}")
    return result.to_dict()


@router.get("/runs/{run_id}")
async def get_run(run_id: str, request: Request):
    runtime = _runtime(request)
    result = runtime.runs.get(run_id)
    if result is None:
        raise HTTPException(404, f"Run {run_id} not found")
    return result.to_dict()


@router.get("/events")
async def recent_events(request: Request, limit: int = 50):
    """Newest-first event feed across all runs — powers the Command Center ops feed."""
    runtime = _runtime(request)
    return {"items": runtime.recent_events(limit=limit)}
