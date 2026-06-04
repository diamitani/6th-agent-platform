import asyncio
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from loguru import logger


class TaskPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TaskPhase(Enum):
    PRE_D = "pred"
    DESIGN = "design"
    DEVELOPMENT = "development"
    DEPLOYMENT = "deployment"
    DEBUGGING = "debugging"


@dataclass
class SwarmTask:
    id: str
    title: str
    description: str
    phase: TaskPhase
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent: Optional[str] = None
    depends_on: list[str] = field(default_factory=list)
    subtasks: list[str] = field(default_factory=list)
    artifacts: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: dict = field(default_factory=dict)


class SwarmCoordinator:
    def __init__(self, message_bus=None, state_manager=None):
        self.message_bus = message_bus
        self.state_manager = state_manager
        self.tasks: dict[str, SwarmTask] = {}
        self._listeners = {}
        logger.info("SwarmCoordinator initialized")

    async def dispatch_task(self, task: SwarmTask) -> str:
        self.tasks[task.id] = task
        logger.info(f"Task dispatched: {task.title} [{task.id}]")

        if self.message_bus:
            await self.message_bus.publish(
                "swarm.task.dispatched",
                {
                    "task_id": task.id,
                    "title": task.title,
                    "phase": task.phase.value,
                    "priority": task.priority.value,
                },
            )

        agent = await self._select_agent(task)
        if agent:
            task.assigned_agent = agent
            task.status = TaskStatus.ASSIGNED
            await self._notify_agent(agent, task)

        return task.id

    async def update_task_status(
        self, task_id: str, status: TaskStatus, agent: str = None
    ):
        task = self.tasks.get(task_id)
        if not task:
            logger.warning(f"Task not found: {task_id}")
            return

        task.status = status
        if status == TaskStatus.IN_PROGRESS and not task.started_at:
            task.started_at = datetime.utcnow()
        if status == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()

        if self.message_bus:
            await self.message_bus.publish(
                "swarm.task.status_changed",
                {
                    "task_id": task_id,
                    "status": status.value,
                    "agent": agent,
                },
            )

        logger.info(f"Task {task_id} -> {status.value}")

    async def resolve_dependencies(self, task_id: str) -> list[str]:
        task = self.tasks.get(task_id)
        if not task:
            return []

        blocked_by = []
        for dep_id in task.depends_on:
            dep = self.tasks.get(dep_id)
            if dep and dep.status != TaskStatus.COMPLETED:
                blocked_by.append(dep_id)

        if blocked_by:
            task.status = TaskStatus.BLOCKED
            logger.info(f"Task {task_id} blocked by: {blocked_by}")

        return blocked_by

    async def create_subtask(
        self, parent_id: str, title: str, description: str, agent: str = None
    ) -> str:
        parent = self.tasks.get(parent_id)
        if not parent:
            raise ValueError(f"Parent task not found: {parent_id}")

        subtask = SwarmTask(
            id=f"{parent_id}/{len(parent.subtasks) + 1}",
            title=title,
            description=description,
            phase=parent.phase,
            priority=parent.priority,
            depends_on=[parent_id],
            assigned_agent=agent,
        )
        parent.subtasks.append(subtask.id)
        return await self.dispatch_task(subtask)

    async def get_agent_workload(self, agent_id: str) -> list[SwarmTask]:
        return [
            t
            for t in self.tasks.values()
            if t.assigned_agent == agent_id
            and t.status in (TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS)
        ]

    async def get_phase_tasks(self, phase: TaskPhase) -> list[SwarmTask]:
        return [t for t in self.tasks.values() if t.phase == phase]

    async def get_task_graph(self) -> dict:
        return {
            task_id: {
                "title": task.title,
                "status": task.status.value,
                "phase": task.phase.value,
                "priority": task.priority.value,
                "agent": task.assigned_agent,
                "depends_on": task.depends_on,
                "subtasks": task.subtasks,
            }
            for task_id, task in self.tasks.items()
        }

    async def _select_agent(self, task: SwarmTask) -> Optional[str]:
        agent_map = {
            TaskPhase.PRE_D: "product",
            TaskPhase.DESIGN: "design",
            TaskPhase.DEVELOPMENT: "development",
            TaskPhase.DEPLOYMENT: "devops",
            TaskPhase.DEBUGGING: "qa",
        }
        base = agent_map.get(task.phase, "development")

        workloads = {}
        for agent_id in list(agent_map.values()) + [
            "engineering",
            "ai",
            "backend",
            "frontend",
            "security",
        ]:
            wl = await self.get_agent_workload(agent_id)
            workloads[agent_id] = len(wl)

        available = [a for a in workloads if workloads[a] < 3]
        if base in available:
            return base
        return min(available, key=lambda a: workloads[a]) if available else base

    async def _notify_agent(self, agent_id: str, task: SwarmTask):
        logger.info(f"Notifying agent '{agent_id}' of task: {task.title}")
        if self.message_bus:
            await self.message_bus.publish(
                f"agent.{agent_id}.task_assigned",
                {
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "phase": task.phase.value,
                    "priority": task.priority.value,
                },
            )

    def on(self, event: str, callback):
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(callback)

    async def emit(self, event: str, data: dict):
        for cb in self._listeners.get(event, []):
            await cb(data)
