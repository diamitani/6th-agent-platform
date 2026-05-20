"""Agent allocation based on capability matching"""

from typing import List, Optional, Dict
from dataclasses import dataclass
from rostr.npao.prioritizer import Task
from rostr.npao.phases import Phase


@dataclass
class Agent:
    """Agent definition for allocation"""
    id: str
    name: str
    type: str  # builder, researcher, reviewer, etc.
    phases: List[Phase]  # Phases this agent can handle
    current_tasks: List[str]  # Currently assigned task IDs
    max_parallel_tasks: int = 3


class AgentAllocator:
    """Allocates tasks to agents based on capability and availability"""

    def allocate(self, task: Task, agents: List[Agent]) -> Optional[Agent]:
        """
        Allocate a task to the best available agent

        Returns: Agent or None if no eligible agents
        """

        # Filter to eligible agents
        eligible = [
            a for a in agents
            if self._is_eligible(a, task)
        ]

        if not eligible:
            return None

        # Score each eligible agent
        scores = {
            agent: self._score_agent(agent, task)
            for agent in eligible
        }

        # Return highest scoring agent
        return max(scores, key=scores.get)

    def _is_eligible(self, agent: Agent, task: Task) -> bool:
        """Check if agent is eligible for task"""

        # Check phase compatibility
        if task.phase not in agent.phases:
            return False

        # Check capacity
        if len(agent.current_tasks) >= agent.max_parallel_tasks:
            return False

        # Check if blocked
        if task.blocked_by:
            return False  # Task has unresolved dependencies

        return True

    def _score_agent(self, agent: Agent, task: Task) -> float:
        """
        Score agent fit for task

        Based on:
        - Context: Does agent already know relevant context?
        - Specialization: How well does skillset match?
        - Load: How many tasks is agent currently handling?
        """

        context_score = self._context_score(agent, task) * 0.4
        specialization_score = self._specialization_score(agent, task) * 0.4
        load_score = self._load_score(agent) * 0.2

        return context_score + specialization_score + load_score

    def _context_score(self, agent: Agent, task: Task) -> float:
        """Score based on relevant context"""
        # In production, would check if agent has worked on related tasks
        # For now, simple heuristic
        return 0.7  # Default moderate context

    def _specialization_score(self, agent: Agent, task: Task) -> float:
        """Score based on agent specialization"""

        # Map agent types to phase preferences
        specialization_matrix = {
            ("researcher", Phase.PRED): 1.0,
            ("architect", Phase.DESIGN): 1.0,
            ("designer", Phase.DESIGN): 1.0,
            ("builder", Phase.DEVELOPMENT): 1.0,
            ("reviewer", Phase.DEVELOPMENT): 0.9,
            ("qa", Phase.DEVELOPMENT): 0.8,
            ("deploy", Phase.DEPLOYMENT): 1.0,
            ("investigate", Phase.DEBUGGING): 1.0,
        }

        return specialization_matrix.get((agent.type, task.phase), 0.5)

    def _load_score(self, agent: Agent) -> float:
        """Score based on current load (lower load = higher score)"""
        load_ratio = len(agent.current_tasks) / agent.max_parallel_tasks
        return 1.0 - load_ratio  # Invert so less load = higher score
