"""Priority scoring for tasks"""

from dataclasses import dataclass
from typing import List
from rostr.npao.phases import Phase, Phase5D


@dataclass
class Task:
    """A task to be prioritized and allocated"""
    id: str
    description: str
    phase: Phase
    blocks: List[str]  # Task IDs this task blocks
    blocked_by: List[str]  # Task IDs blocking this task
    business_impact: float  # 0-10 scale
    estimated_hours: float


class PriorityScorer:
    """
    Scores tasks based on four dimensions:
    1. Phase Urgency (0-10)
    2. Dependency Impact (0-10)
    3. Business Impact (0-10)
    4. Resource Efficiency (0-10)
    """

    def __init__(
        self,
        phase_weight: float = 0.35,
        dependency_weight: float = 0.30,
        business_weight: float = 0.25,
        efficiency_weight: float = 0.10
    ):
        self.phase_weight = phase_weight
        self.dependency_weight = dependency_weight
        self.business_weight = business_weight
        self.efficiency_weight = efficiency_weight

    def score(self, task: Task, all_tasks: List[Task]) -> float:
        """
        Calculate priority score for a task

        Returns: float between 0-10
        """

        phase_urgency = self._score_phase_urgency(task)
        dependency_impact = self._score_dependency_impact(task, all_tasks)
        business_impact = task.business_impact  # Already 0-10
        resource_efficiency = self._score_resource_efficiency(task)

        priority = (
            phase_urgency * self.phase_weight +
            dependency_impact * self.dependency_weight +
            business_impact * self.business_weight +
            resource_efficiency * self.efficiency_weight
        )

        return priority

    def _score_phase_urgency(self, task: Task) -> float:
        """Score based on phase"""
        base_urgency = Phase5D.get_base_urgency(task.phase)

        # Apply modifiers
        modifiers = {
            Phase.DEBUGGING: 0,  # Always 10, no modifiers
            Phase.DEPLOYMENT: 2 if "revenue" in task.description.lower() else 0,
            Phase.DEVELOPMENT: 2 if "blocked" in task.description.lower() else 0,
            Phase.DESIGN: 1 if "team waiting" in task.description.lower() else 0,
            Phase.PRED: 3 if "deadline" in task.description.lower() else 0,
        }

        modifier = modifiers.get(task.phase, 0)
        return min(10, base_urgency + modifier)

    def _score_dependency_impact(self, task: Task, all_tasks: List[Task]) -> float:
        """Score based on how many other tasks this blocks"""
        blocked_count = len(task.blocks)

        if blocked_count == 0:
            return 0
        elif blocked_count <= 2:
            return 3
        elif blocked_count <= 5:
            return 6
        else:
            return 10

    def _score_resource_efficiency(self, task: Task) -> float:
        """Score based on value per agent-hour"""
        if task.estimated_hours < 1:
            return 10  # Quick win
        elif task.estimated_hours <= 4:
            return 7  # Moderate
        elif task.estimated_hours <= 8:
            return 4  # Complex
        else:
            return 2  # Multi-day

    def prioritize(self, tasks: List[Task]) -> List[Task]:
        """
        Sort tasks by priority score

        Returns: tasks sorted by priority (highest first)
        """
        scored = [(task, self.score(task, tasks)) for task in tasks]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [task for task, score in scored]
