"""Main Rostr Hub - Central orchestration platform"""

from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import asyncio

from rostr.core.registry import AgentRegistry, AgentDefinition
from rostr.core.state import StateManager
from rostr.core.events import EventBus
from rostr.pal.compiler import PALCompiler, CompiledInstruction
from rostr.ragdal.pipeline import RAGDALPipeline
from rostr.npao.orchestrator import NPAOOrchestrator


class RostrHub:
    """
    Rostr Hub - Central Agent Operating System

    Integrates:
    - PAL (Prompt Abstraction Layer)
    - RAG DAL (Dynamic Acquisition Layer)
    - NPAO (Navigate, Prioritize, Allocate, Orchestrate)
    - Agent Registry
    - State Management
    - Event Bus
    """

    def __init__(
        self,
        workspace: str = "default",
        storage_path: Optional[Path] = None
    ):
        self.workspace = workspace
        self.storage_path = storage_path or Path.cwd() / "rostr-data"
        self.storage_path.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.registry = AgentRegistry(self.storage_path / "agents")
        self.state = StateManager(self.storage_path / "state")
        self.events = EventBus()
        self.pal = PALCompiler(workspace_path=self.storage_path)
        self.ragdal = RAGDALPipeline(storage_path=self.storage_path / "knowledge")
        self.npao = NPAOOrchestrator()

        # Initialize workspace
        self._init_workspace()

    def _init_workspace(self):
        """Initialize workspace directories"""
        workspace_path = self.storage_path / "projects" / self.workspace
        workspace_path.mkdir(parents=True, exist_ok=True)

        # Create standard files if they don't exist
        readme = workspace_path / "README.md"
        if not readme.exists():
            readme.write_text(f"# {self.workspace}\n\nRostr workspace initialized on {datetime.now().isoformat()}\n")

        goals = workspace_path / "goals.md"
        if not goals.exists():
            goals.write_text("# Goals\n\n- Define project goals here\n")

        decisions = workspace_path / "decisions.md"
        if not decisions.exists():
            decisions.write_text("# Decisions\n\n")

    def register_agent(self, agent: AgentDefinition):
        """Register an agent with the hub"""
        self.registry.register(agent)

        # Log the registration
        self.state.append_to_log(
            "timeline",
            {
                "event": "agent_registered",
                "agent_id": agent.agent_id,
                "agent_name": agent.name,
                "agent_type": agent.type
            },
            f"project/{self.workspace}"
        )

    def execute(
        self,
        raw_input: str,
        org_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute a task through the full Rostr pipeline

        Flow:
        1. PAL compiles intent
        2. NPAO navigates to phase
        3. If research needed → RAG DAL
        4. NPAO allocates to agent
        5. Agent executes (simulated for MVP)
        6. State persisted

        Args:
            raw_input: Natural language instruction
            org_id: Optional organization context
            session_id: Optional session context

        Returns:
            Execution result
        """

        # Step 1: Compile with PAL
        compiled = self.pal.compile(
            raw_input=raw_input,
            project_id=self.workspace,
            org_id=org_id,
            session_id=session_id
        )

        # Step 2: Navigate phase with NPAO
        phase = self.npao.navigate(compiled.intent.primary_intent)

        # Step 3: Research if needed (PreD phase or research domain)
        research_result = None
        if phase.value == "pred" or compiled.intent.domain.value == "research":
            # Execute RAG DAL search
            research_result = asyncio.run(
                self.ragdal.search(
                    query=compiled.intent.primary_intent,
                    namespace=f"project/{self.workspace}"
                )
            )

        # Step 4: Log execution
        self.state.append_to_log(
            "timeline",
            {
                "event": "task_executed",
                "raw_input": raw_input,
                "intent": compiled.intent.primary_intent,
                "phase": phase.value,
                "agent_type": compiled.route.agent_type,
                "had_research": research_result is not None
            },
            f"project/{self.workspace}"
        )

        # Step 5: Build result
        result = {
            "workspace": self.workspace,
            "input": raw_input,
            "compiled_intent": compiled.intent.primary_intent,
            "phase": phase.value,
            "agent_type": compiled.route.agent_type,
            "enhanced_prompt": compiled.enhanced_prompt,
            "research": research_result.to_markdown() if research_result else None,
            "timestamp": datetime.now().isoformat()
        }

        return result

    def get_context(self, project_id: Optional[str] = None) -> Dict[str, Any]:
        """Get current context for a project"""

        pid = project_id or self.workspace

        # Load project context
        goals = self.state.get("goals", f"project/{pid}")
        recent_timeline = self.state.read_log("timeline", f"project/{pid}", limit=10)

        return {
            "project": pid,
            "goals": goals,
            "recent_activity": recent_timeline
        }

    def close(self):
        """Clean up resources"""
        asyncio.run(self.ragdal.close())
