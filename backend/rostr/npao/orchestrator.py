"""
NPAO Orchestrator — Necessity, Priority, Anxiety, Opportunity.

Implements the ROSTR decision layer from the ROSTR paper (Section 6):
every task is classified into one of four human-motivational categories
and executed in the order N → A → P → O.

    N — Necessity    "I MUST"                  hard blocker; nothing downstream proceeds
    A — Anxiety      "I WON'T HAVE PEACE"      cognitive friction; clear before Priority
    P — Priority     "I NEED"                  mission-critical forward motion
    O — Opportunity  "I CAN"                   growth work; never preempts anything

Also implements the multi-dimensional composite priority score:
    score = phase_urgency*0.35 + dependency_impact*0.30
          + business_impact*0.25 + resource_efficiency*0.10
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class NPAOClass(str, Enum):
    NECESSITY = "necessity"
    ANXIETY = "anxiety"
    PRIORITY = "priority"
    OPPORTUNITY = "opportunity"


# Execution order per the paper: N → A → P → O
EXECUTION_ORDER = [
    NPAOClass.NECESSITY,
    NPAOClass.ANXIETY,
    NPAOClass.PRIORITY,
    NPAOClass.OPPORTUNITY,
]


class Phase5D(str, Enum):
    PRED = "pred"
    DESIGN = "design"
    DEVELOPMENT = "development"
    DEPLOYMENT = "deployment"
    DEBUGGING = "debugging"


PHASE_URGENCY = {
    Phase5D.DEBUGGING: 10,
    Phase5D.DEPLOYMENT: 8,
    Phase5D.DEVELOPMENT: 6,
    Phase5D.DESIGN: 4,
    Phase5D.PRED: 2,
}

# Keyword signals used by the heuristic classifier. An LLM classifier can be
# layered on top; these mirror the routing rules in the paper's PAL Stage 5.
_NECESSITY_SIGNALS = (
    "must", "blocker", "blocked", "cannot proceed", "can't proceed", "required before",
    "prerequisite", "outage", "down", "broken build", "credentials", "api key",
    "auth", "compliance", "legal", "security breach", "production down",
)
_ANXIETY_SIGNALS = (
    "backlog", "overdue", "nagging", "cleanup", "clean up", "tech debt",
    "technical debt", "unresolved", "open loop", "won't have peace", "worry",
    "anxious", "lingering", "stale", "follow up", "follow-up", "unanswered",
)
_OPPORTUNITY_SIGNALS = (
    "could", "might", "experiment", "explore", "a/b test", "ab test", "stretch",
    "nice to have", "nice-to-have", "growth", "upsell", "expand", "optimize later",
    "someday", "idea:", "moonshot",
)


@dataclass
class NPAOTask:
    title: str
    description: str = ""
    npao_class: NPAOClass = NPAOClass.PRIORITY
    phase: Phase5D = Phase5D.DEVELOPMENT
    # Composite score dimensions (0-10 each)
    phase_urgency: float = 6.0
    dependency_impact: float = 5.0
    business_impact: float = 5.0
    resource_efficiency: float = 5.0
    status: str = "queued"  # queued | active | done | cancelled
    assigned_agent: Optional[str] = None
    blocks: list[str] = field(default_factory=list)  # task ids this task blocks
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    @property
    def composite_score(self) -> float:
        return round(
            self.phase_urgency * 0.35
            + self.dependency_impact * 0.30
            + self.business_impact * 0.25
            + self.resource_efficiency * 0.10,
            2,
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "npao_class": self.npao_class.value,
            "phase": self.phase.value,
            "composite_score": self.composite_score,
            "status": self.status,
            "assigned_agent": self.assigned_agent,
            "blocks": self.blocks,
            "created_at": self.created_at,
            "dimensions": {
                "phase_urgency": self.phase_urgency,
                "dependency_impact": self.dependency_impact,
                "business_impact": self.business_impact,
                "resource_efficiency": self.resource_efficiency,
            },
        }


class NPAOClassifier:
    """Classify tasks into NECESSITY | ANXIETY | PRIORITY | OPPORTUNITY."""

    def classify(
        self,
        title: str,
        description: str = "",
        blocks_downstream: bool = False,
    ) -> NPAOClass:
        text = f"{title} {description}".lower()
        if blocks_downstream or any(s in text for s in _NECESSITY_SIGNALS):
            return NPAOClass.NECESSITY
        if any(s in text for s in _ANXIETY_SIGNALS):
            return NPAOClass.ANXIETY
        if any(s in text for s in _OPPORTUNITY_SIGNALS):
            return NPAOClass.OPPORTUNITY
        return NPAOClass.PRIORITY


class NPAOOrchestrator:
    """
    In-process NPAO queue manager.

    Maintains the task board, classifies incoming tasks, and builds the
    execution queue in N → A → P → O order (composite score descending
    within each class). Conflict rule: NECESSITY > ANXIETY > PRIORITY >
    OPPORTUNITY — an Opportunity task never preempts anything.
    """

    def __init__(self):
        self.classifier = NPAOClassifier()
        self._tasks: dict[str, NPAOTask] = {}

    # ------------------------------------------------------------------ CRUD

    def add_task(
        self,
        title: str,
        description: str = "",
        phase: str | Phase5D = Phase5D.DEVELOPMENT,
        npao_class: str | NPAOClass | None = None,
        blocks_downstream: bool = False,
        business_impact: float = 5.0,
        dependency_impact: float | None = None,
        resource_efficiency: float = 5.0,
        assigned_agent: Optional[str] = None,
    ) -> NPAOTask:
        phase = Phase5D(phase)
        resolved_class = (
            NPAOClass(npao_class)
            if npao_class
            else self.classifier.classify(title, description, blocks_downstream)
        )
        if dependency_impact is None:
            dependency_impact = 9.0 if resolved_class == NPAOClass.NECESSITY else 5.0

        task = NPAOTask(
            title=title,
            description=description,
            npao_class=resolved_class,
            phase=phase,
            phase_urgency=float(PHASE_URGENCY[phase]),
            dependency_impact=float(dependency_impact),
            business_impact=float(business_impact),
            resource_efficiency=float(resource_efficiency),
            assigned_agent=assigned_agent,
        )
        self._tasks[task.id] = task
        return task

    def get_task(self, task_id: str) -> Optional[NPAOTask]:
        return self._tasks.get(task_id)

    def update_status(self, task_id: str, status: str) -> Optional[NPAOTask]:
        task = self._tasks.get(task_id)
        if task:
            task.status = status
        return task

    def remove_task(self, task_id: str) -> bool:
        return self._tasks.pop(task_id, None) is not None

    # ----------------------------------------------------------------- Queue

    def execution_queue(self, include_done: bool = False) -> list[NPAOTask]:
        """Full board ordered N → A → P → O, score-descending within class."""
        tasks = [
            t
            for t in self._tasks.values()
            if include_done or t.status in ("queued", "active")
        ]
        order_index = {c: i for i, c in enumerate(EXECUTION_ORDER)}
        return sorted(
            tasks,
            key=lambda t: (order_index[t.npao_class], -t.composite_score),
        )

    def next_task(self) -> Optional[NPAOTask]:
        """The single next task to execute under NPAO conflict rules.

        If any NECESSITY is open it wins regardless of other scores —
        Necessities block all other allocation in scope.
        """
        queue = self.execution_queue()
        return queue[0] if queue else None

    def canvas(self) -> dict[str, list[dict]]:
        """The NPAO Canvas: four columns, ready to render."""
        columns: dict[str, list[dict]] = {c.value: [] for c in EXECUTION_ORDER}
        for task in self.execution_queue(include_done=True):
            columns[task.npao_class.value].append(task.to_dict())
        return columns

    def stats(self) -> dict:
        by_class = {c.value: 0 for c in EXECUTION_ORDER}
        by_status: dict[str, int] = {}
        for t in self._tasks.values():
            by_class[t.npao_class.value] += 1
            by_status[t.status] = by_status.get(t.status, 0) + 1
        return {
            "total": len(self._tasks),
            "by_class": by_class,
            "by_status": by_status,
            "execution_order": [c.value for c in EXECUTION_ORDER],
        }
