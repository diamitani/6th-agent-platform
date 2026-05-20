"""Base agent class"""

from typing import List, Dict, Any
from rostr.core.registry import AgentDefinition
from rostr.npao.phases import Phase


class BaseAgent:
    """Base class for all agents"""

    def __init__(
        self,
        agent_id: str,
        name: str,
        agent_type: str,
        capabilities: List[str],
        tools: List[str],
        phases: List[Phase],
        model: str = "claude-sonnet-4-6"
    ):
        self.agent_id = agent_id
        self.name = name
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.tools = tools
        self.phases = phases
        self.model = model

    def to_definition(self) -> AgentDefinition:
        """Convert to agent definition"""
        return AgentDefinition(
            agent_id=self.agent_id,
            name=self.name,
            type=self.agent_type,
            capabilities=self.capabilities,
            tools=self.tools,
            phases=[p.value for p in self.phases],
            model=self.model,
            context_requirements=["project"],
            output_formats=self._get_output_formats()
        )

    def _get_output_formats(self) -> List[str]:
        """Get supported output formats"""
        return ["markdown"]  # Override in subclasses
