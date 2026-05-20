"""
PAL (Prompt Abstraction Layer) - Compiler
Compiles natural language intent into precise agent instructions
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum
import json
from loguru import logger

from ..llm.ollama_client import get_ollama_client


class Domain(str, Enum):
    CODE = "code"
    DESIGN = "design"
    RESEARCH = "research"
    OPS = "ops"
    SALES = "sales"
    MARKETING = "marketing"
    SUPPORT = "support"
    CUSTOM = "custom"


class AutonomyLevel(str, Enum):
    SUPERVISED = "supervised"
    SEMI_AUTONOMOUS = "semi-autonomous"
    FULLY_AUTONOMOUS = "fully-autonomous"


class StateRequirement(str, Enum):
    STATELESS = "stateless"
    SESSION = "session"
    PERSISTENT = "persistent"
    CROSS_SESSION = "cross-session"


class Stakes(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class IntentObject:
    """Extracted intent from raw input"""
    primary_intent: str
    domain: Domain
    subject: Optional[str] = None
    constraints: List[str] = field(default_factory=list)
    desired_output: Optional[str] = None
    urgency: str = "queued"
    ambiguity_score: float = 0.0
    raw_input: str = ""


@dataclass
class AgentIntent:
    """Detailed agent specification"""
    primary_job: str
    domain: Domain
    actor: str
    trigger: str
    inputs: List[str]
    outputs: List[str]
    tools_needed: List[str]
    autonomy_level: AutonomyLevel
    state_requirements: StateRequirement
    stakes: Stakes


@dataclass
class CompiledInstruction:
    """Compiled instruction ready for execution"""
    original_input: str
    intent: IntentObject
    enhanced_prompt: str
    system_prompt: str
    runtime_config: Dict[str, Any]
    route_to: str
    confidence: float
    metadata: Dict[str, Any] = field(default_factory=dict)


class PALCompiler:
    """Main PAL compilation engine"""

    def __init__(self):
        self.ollama = get_ollama_client()
        self.fast_model = "deepseek-r1:7b"

    async def compile(
        self,
        raw_input: str,
        context: Optional[Dict[str, Any]] = None
    ) -> CompiledInstruction:
        """
        Full compilation pipeline:
        1. Extract intent
        2. Inject context
        3. Enhance semantically
        4. Build runtime config
        5. Route to agent
        """
        logger.info(f"PAL compiling input: {raw_input[:100]}...")

        # Step 1: Extract Intent
        intent = await self.extract_intent(raw_input)

        # Step 2: Inject Context
        enriched_intent = await self.inject_context(intent, context or {})

        # Step 3: Enhance
        enhanced_prompt, system_prompt = await self.enhance(enriched_intent)

        # Step 4: Build Runtime Config
        runtime_config = await self.build_runtime_config(enriched_intent)

        # Step 5: Route
        route_to = await self.route(enriched_intent)

        compiled = CompiledInstruction(
            original_input=raw_input,
            intent=enriched_intent,
            enhanced_prompt=enhanced_prompt,
            system_prompt=system_prompt,
            runtime_config=runtime_config,
            route_to=route_to,
            confidence=1.0 - enriched_intent.ambiguity_score
        )

        logger.info(f"PAL compiled → Route: {route_to}, Confidence: {compiled.confidence:.2f}")
        return compiled

    async def extract_intent(self, raw_input: str) -> IntentObject:
        """Extract structured intent from raw input"""
        extraction_prompt = f"""Analyze this user request and extract the intent in JSON format:

User Request: "{raw_input}"

Extract the following and return as JSON:
{{
    "primary_intent": "What the user fundamentally wants to achieve",
    "domain": "code|design|research|ops|sales|marketing|support|custom",
    "subject": "The thing being acted upon (or null)",
    "constraints": ["List of explicit constraints or requirements"],
    "desired_output": "What the final output should be",
    "urgency": "immediate|queued|scheduled",
    "ambiguity_score": 0.0-1.0
}}

Return ONLY valid JSON, no explanation."""

        try:
            response = await self.ollama.generate(
                model=self.fast_model,
                prompt=extraction_prompt,
                temperature=0.3
            )

            # Parse JSON from response
            json_str = response.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()

            data = json.loads(json_str)

            intent = IntentObject(
                primary_intent=data.get("primary_intent", raw_input),
                domain=Domain(data.get("domain", "custom")),
                subject=data.get("subject"),
                constraints=data.get("constraints", []),
                desired_output=data.get("desired_output"),
                urgency=data.get("urgency", "queued"),
                ambiguity_score=float(data.get("ambiguity_score", 0.5)),
                raw_input=raw_input
            )

            logger.info(f"Intent extracted: {intent.primary_intent}")
            return intent

        except Exception as e:
            logger.warning(f"Intent extraction failed, using fallback: {e}")
            # Fallback to simple intent
            return IntentObject(
                primary_intent=raw_input,
                domain=Domain.CUSTOM,
                raw_input=raw_input,
                ambiguity_score=0.8
            )

    async def inject_context(
        self,
        intent: IntentObject,
        context: Dict[str, Any]
    ) -> IntentObject:
        """Inject relevant context into intent"""
        # Add context information to intent metadata
        # This would load from Reference Hub in production
        logger.debug(f"Context injected: {list(context.keys())}")
        return intent

    async def enhance(
        self,
        intent: IntentObject
    ) -> tuple[str, str]:
        """Enhance intent into precise, actionable prompt"""
        enhancement_prompt = f"""Transform this vague intent into a precise, actionable instruction.

Original Intent: {intent.primary_intent}
Domain: {intent.domain}
Constraints: {', '.join(intent.constraints) if intent.constraints else 'None'}

Create an enhanced version that:
1. Expands ambiguous verbs into specific actions
2. Adds missing technical precision
3. Breaks compound goals into ordered sub-tasks
4. Includes success criteria
5. Removes hedging language

Return format:
ENHANCED_PROMPT: [the enhanced instruction]
SYSTEM_CONTEXT: [system context for the agent]

Be specific and actionable."""

        try:
            response = await self.ollama.generate(
                model=self.fast_model,
                prompt=enhancement_prompt,
                temperature=0.4
            )

            # Parse response
            lines = response.strip().split("\n")
            enhanced_prompt = ""
            system_prompt = ""

            capture_mode = None
            for line in lines:
                if "ENHANCED_PROMPT:" in line:
                    capture_mode = "enhanced"
                    enhanced_prompt = line.split("ENHANCED_PROMPT:")[-1].strip()
                elif "SYSTEM_CONTEXT:" in line:
                    capture_mode = "system"
                    system_prompt = line.split("SYSTEM_CONTEXT:")[-1].strip()
                elif capture_mode == "enhanced" and line.strip():
                    enhanced_prompt += " " + line.strip()
                elif capture_mode == "system" and line.strip():
                    system_prompt += " " + line.strip()

            if not enhanced_prompt:
                enhanced_prompt = intent.primary_intent

            if not system_prompt:
                system_prompt = f"You are an AI assistant specialized in {intent.domain}."

            logger.info("Intent enhanced successfully")
            return enhanced_prompt, system_prompt

        except Exception as e:
            logger.warning(f"Enhancement failed, using original: {e}")
            return (
                intent.primary_intent,
                f"You are an AI assistant specialized in {intent.domain}."
            )

    async def build_runtime_config(
        self,
        intent: IntentObject
    ) -> Dict[str, Any]:
        """Build runtime configuration"""
        config = {
            "agent_type": self._infer_agent_type(intent),
            "model": self._select_model(intent),
            "tools_enabled": self._infer_tools(intent),
            "memory_mode": "session",
            "output_format": "markdown",
            "verification_required": intent.stakes in ["high", "critical"] if hasattr(intent, "stakes") else False,
            "timeout_seconds": 120
        }

        return config

    async def route(self, intent: IntentObject) -> str:
        """Route to appropriate agent"""
        # Simple routing based on domain
        routing_map = {
            Domain.CODE: "builder_agent",
            Domain.DESIGN: "design_agent",
            Domain.RESEARCH: "research_agent",
            Domain.OPS: "ops_agent",
            Domain.SALES: "sales_agent",
            Domain.MARKETING: "marketing_agent",
            Domain.SUPPORT: "support_agent",
            Domain.CUSTOM: "general_agent"
        }

        return routing_map.get(intent.domain, "general_agent")

    def _infer_agent_type(self, intent: IntentObject) -> str:
        """Infer agent type from intent"""
        domain_map = {
            Domain.CODE: "builder",
            Domain.DESIGN: "designer",
            Domain.RESEARCH: "researcher",
            Domain.OPS: "operator",
            Domain.SALES: "sales",
            Domain.MARKETING: "marketer",
            Domain.SUPPORT: "support",
            Domain.CUSTOM: "general"
        }
        return domain_map.get(intent.domain, "general")

    def _select_model(self, intent: IntentObject) -> str:
        """Select appropriate model based on complexity"""
        # Use fast model by default, reasoning model for complex tasks
        if intent.ambiguity_score > 0.7:
            return "deepseek-r1:32b"  # Reasoning model for complex tasks
        return "deepseek-r1:7b"  # Fast model for simple tasks

    def _infer_tools(self, intent: IntentObject) -> Dict[str, bool]:
        """Infer required tools"""
        tools = {
            "web_search": False,
            "file_system": False,
            "browser": False,
            "code_execution": False,
            "external_apis": []
        }

        # Simple heuristics
        if intent.domain == Domain.CODE:
            tools["file_system"] = True
            tools["code_execution"] = True
        elif intent.domain == Domain.RESEARCH:
            tools["web_search"] = True
        elif intent.domain == Domain.DESIGN:
            tools["browser"] = True

        return tools

    async def compile_agent_spec(
        self,
        description: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AgentIntent:
        """Compile full agent specification from description"""
        spec_prompt = f"""Analyze this agent description and create a detailed specification:

Description: "{description}"

Extract and return as JSON:
{{
    "primary_job": "What this agent fundamentally exists to do",
    "domain": "code|sales|research|ops|marketing|support|custom",
    "actor": "Who uses this agent (role, expertise level)",
    "trigger": "What initiates the agent",
    "inputs": ["What the agent receives"],
    "outputs": ["What the agent delivers"],
    "tools_needed": ["Required tools/APIs"],
    "autonomy_level": "supervised|semi-autonomous|fully-autonomous",
    "state_requirements": "stateless|session|persistent|cross-session",
    "stakes": "low|medium|high|critical"
}}

Return ONLY valid JSON."""

        try:
            response = await self.ollama.generate(
                model=self.fast_model,
                prompt=spec_prompt,
                temperature=0.3
            )

            # Parse JSON
            json_str = response.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()

            data = json.loads(json_str)

            agent_intent = AgentIntent(
                primary_job=data["primary_job"],
                domain=Domain(data["domain"]),
                actor=data["actor"],
                trigger=data["trigger"],
                inputs=data["inputs"],
                outputs=data["outputs"],
                tools_needed=data["tools_needed"],
                autonomy_level=AutonomyLevel(data["autonomy_level"]),
                state_requirements=StateRequirement(data["state_requirements"]),
                stakes=Stakes(data["stakes"])
            )

            logger.info(f"Agent spec compiled: {agent_intent.primary_job}")
            return agent_intent

        except Exception as e:
            logger.error(f"Agent spec compilation failed: {e}")
            raise
