"""PAL Compiler - Main orchestration of the Prompt Abstraction Layer"""

from typing import Optional
from dataclasses import dataclass
from pathlib import Path
import anthropic
import os

from rostr.pal.intent import IntentExtractor, Intent
from rostr.pal.context import ContextInjector, AgentContext
from rostr.pal.router import Router, RouteTarget


@dataclass
class CompiledInstruction:
    """Fully compiled instruction ready for agent execution"""
    intent: Intent
    context: AgentContext
    enhanced_prompt: str
    route: RouteTarget
    runtime_config: dict

    def to_dict(self) -> dict:
        return {
            "intent": self.intent.to_dict(),
            "context": {
                "project": self.context.project_context,
                "user": self.context.user_context,
                "org": self.context.org_context,
                "session": self.context.session_context,
            },
            "enhanced_prompt": self.enhanced_prompt,
            "route": {
                "agent_type": self.route.agent_type,
                "tools_enabled": self.route.tools_enabled,
                "memory_mode": self.route.memory_mode,
                "output_format": self.route.output_format,
                "verification_required": self.route.verification_required,
            },
            "runtime_config": self.runtime_config,
        }


class PALCompiler:
    """
    Prompt Abstraction Layer Compiler

    Compiles vague human input into precise agent instructions through:
    1. Intent Extraction
    2. Context Injection
    3. Semantic Enhancement
    4. Runtime Compilation
    5. Output Routing
    """

    def __init__(
        self,
        workspace_path: Optional[Path] = None,
        model: str = "claude-haiku-4-5"
    ):
        self.workspace_path = workspace_path or Path.cwd() / "rostr-data"
        self.model = model

        # Initialize components
        self.intent_extractor = IntentExtractor(model=model)
        self.context_injector = ContextInjector(workspace_path=self.workspace_path)
        self.router = Router()
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def compile(
        self,
        raw_input: str,
        project_id: Optional[str] = None,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        session_id: Optional[str] = None,
        model: Optional[str] = None
    ) -> CompiledInstruction:
        """
        Compile raw input into a structured agent instruction

        Args:
            raw_input: Natural language input from user
            project_id: Optional project context identifier
            user_id: Optional user context identifier
            org_id: Optional organization context identifier
            session_id: Optional session context identifier
            model: Optional model override

        Returns:
            CompiledInstruction ready for agent execution
        """

        # Step 1: Extract Intent
        intent = self.intent_extractor.extract(raw_input)

        # Step 2: Inject Context
        context = self.context_injector.inject(
            project_id=project_id,
            user_id=user_id,
            org_id=org_id,
            session_id=session_id
        )

        # Step 3: Semantic Enhancement
        enhanced_prompt = self._enhance(intent, context)

        # Step 4: Runtime Compilation
        runtime_config = self._compile_runtime(intent, model or self.model)

        # Step 5: Route to Target
        route = self.router.route(intent)

        return CompiledInstruction(
            intent=intent,
            context=context,
            enhanced_prompt=enhanced_prompt,
            route=route,
            runtime_config=runtime_config
        )

    def _enhance(self, intent: Intent, context: AgentContext) -> str:
        """
        Enhance intent with semantic precision and context

        Transforms vague input into actionable, specific instructions
        """

        system_prompt = """You are a prompt enhancement system for AI agents.

Your job is to transform extracted intent into precise, actionable instructions.

Enhancement rules:
1. Expand ambiguous verbs into specific actions
2. Add missing technical precision the user clearly needs but didn't state
3. Break compound goals into ordered sub-tasks
4. Add success criteria ("done when...")
5. Remove hedging and replace with directives

Examples:

Vague: "make the landing page better"
Enhanced: "Audit the landing page against 5 conversion dimensions:
1. Headline clarity (does it communicate value in <8 words?)
2. CTA placement and copy (above fold, action verb, low friction)
3. Social proof presence (testimonials, logos, numbers)
4. Load time (target <2s LCP)
5. Mobile layout (tap targets, text size, scroll depth)

For each dimension: score 0-10, explain what a 10 looks like, and implement the highest-impact fix."

Vague: "fix the thing"
Enhanced: "Debug the primary bug in the active file:
1. Identify the error and reproduction steps
2. Find root cause (not just symptoms)
3. Implement fix with proper error handling
4. Add regression test
5. Verify fix works in all edge cases

Done when: bug is resolved, test passes, and code is reviewed."

Be specific, actionable, and directive."""

        # Build the enhancement request
        enhancement_request = f"""Intent: {intent.primary_intent}
Domain: {intent.domain.value}
Subject: {intent.subject}
Constraints: {', '.join(intent.constraints) if intent.constraints else 'None'}
Desired Output: {intent.desired_output}

{context.to_prompt()}

Enhance this intent into a precise, actionable instruction."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": enhancement_request
            }]
        )

        return response.content[0].text

    def _compile_runtime(self, intent: Intent, model: str) -> dict:
        """Compile runtime configuration based on intent"""

        # Select model based on complexity
        if intent.ambiguity_score > 0.7 or intent.domain.value in ["code", "debug"]:
            execution_model = "claude-sonnet-4-6"  # More capable model
        else:
            execution_model = model  # Fast model is fine

        return {
            "model": execution_model,
            "temperature": 0.2 if intent.domain.value == "code" else 0.7,
            "max_tokens": 4096,
            "system_role": f"{intent.domain.value} specialist",
            "timeout_seconds": 180 if intent.urgency.value == "immediate" else 600,
        }
