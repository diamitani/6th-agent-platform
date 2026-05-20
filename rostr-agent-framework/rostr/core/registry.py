"""Agent registry for managing available agents"""

from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
import json


@dataclass
class AgentDefinition:
    """Definition of an agent's capabilities"""
    agent_id: str
    name: str
    type: str
    capabilities: List[str]
    tools: List[str]
    phases: List[str]
    model: str
    context_requirements: List[str]
    output_formats: List[str]
    max_parallel_tasks: int = 3

    def to_dict(self) -> Dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict) -> 'AgentDefinition':
        return cls(**data)


class AgentRegistry:
    """Registry for managing agents"""

    def __init__(self, storage_path: Path):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.agents: Dict[str, AgentDefinition] = {}
        self._load_agents()

    def register(self, agent: AgentDefinition):
        """Register a new agent"""
        self.agents[agent.agent_id] = agent
        self._save_agent(agent)

    def unregister(self, agent_id: str):
        """Unregister an agent"""
        if agent_id in self.agents:
            del self.agents[agent_id]
            agent_file = self.storage_path / f"{agent_id}.json"
            if agent_file.exists():
                agent_file.unlink()

    def get(self, agent_id: str) -> Optional[AgentDefinition]:
        """Get agent by ID"""
        return self.agents.get(agent_id)

    def list_all(self) -> List[AgentDefinition]:
        """List all registered agents"""
        return list(self.agents.values())

    def find_by_type(self, agent_type: str) -> List[AgentDefinition]:
        """Find all agents of a specific type"""
        return [a for a in self.agents.values() if a.type == agent_type]

    def find_by_capability(self, capability: str) -> List[AgentDefinition]:
        """Find all agents with a specific capability"""
        return [a for a in self.agents.values() if capability in a.capabilities]

    def _save_agent(self, agent: AgentDefinition):
        """Save agent definition to disk"""
        agent_file = self.storage_path / f"{agent.agent_id}.json"
        with open(agent_file, 'w') as f:
            json.dump(agent.to_dict(), f, indent=2)

    def _load_agents(self):
        """Load all agents from disk"""
        for agent_file in self.storage_path.glob("*.json"):
            with open(agent_file) as f:
                data = json.load(f)
                agent = AgentDefinition.from_dict(data)
                self.agents[agent.agent_id] = agent
