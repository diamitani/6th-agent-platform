"""Agent Registry - Directory of all registered agents"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime
import uuid


@dataclass
class AgentCapability:
    """Capability declaration for an agent"""
    name: str
    description: str
    parameters: Dict = field(default_factory=dict)


@dataclass
class AgentRegistration:
    """Agent registration record"""
    agent_id: str
    name: str
    description: str
    type: str  # builder, researcher, reviewer, etc.
    capabilities: List[AgentCapability]
    tools: List[str]
    phases: List[str]  # 5D phases this agent can handle
    model: str
    context_requirements: List[str]
    output_formats: List[str]
    max_parallel_tasks: int = 3
    status: str = "active"
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict = field(default_factory=dict)

    def to_dict(self) -> Dict:
        return asdict(self)


class AgentRegistry:
    """Central registry for all agents in the system"""

    def __init__(self):
        self.agents: Dict[str, AgentRegistration] = {}
        self._initialize_default_agents()

    def _initialize_default_agents(self):
        """Register default ROSTR agents"""
        # Builder Agent
        self.register(AgentRegistration(
            agent_id=str(uuid.uuid4()),
            name="Builder Agent",
            description="Code generation and implementation",
            type="builder",
            capabilities=[
                AgentCapability("code_generation", "Generate code from specs"),
                AgentCapability("file_editing", "Edit existing code files"),
                AgentCapability("api_integration", "Integrate external APIs")
            ],
            tools=["file_system", "code_execution", "bash"],
            phases=["development", "debugging"],
            model="deepseek-r1:7b",
            context_requirements=["project", "architecture"],
            output_formats=["code", "diff", "file"]
        ))

        # Research Agent
        self.register(AgentRegistration(
            agent_id=str(uuid.uuid4()),
            name="Research Agent",
            description="Deep research with RAG DAL",
            type="researcher",
            capabilities=[
                AgentCapability("web_research", "Multi-pass web research"),
                AgentCapability("source_validation", "Validate source credibility"),
                AgentCapability("report_generation", "Generate research reports")
            ],
            tools=["rag_dal", "web_search"],
            phases=["prd"],
            model="deepseek-r1:32b",
            context_requirements=["project"],
            output_formats=["markdown", "json"]
        ))

    def register(self, agent: AgentRegistration) -> str:
        """Register a new agent"""
        self.agents[agent.agent_id] = agent
        return agent.agent_id

    def get(self, agent_id: str) -> Optional[AgentRegistration]:
        """Get agent by ID"""
        return self.agents.get(agent_id)

    def list_all(self) -> List[AgentRegistration]:
        """List all registered agents"""
        return list(self.agents.values())

    def find_by_capability(self, capability: str) -> List[AgentRegistration]:
        """Find agents with specific capability"""
        return [
            agent for agent in self.agents.values()
            if any(cap.name == capability for cap in agent.capabilities)
        ]

    def find_by_phase(self, phase: str) -> List[AgentRegistration]:
        """Find agents that can handle a specific phase"""
        return [
            agent for agent in self.agents.values()
            if phase in agent.phases
        ]
