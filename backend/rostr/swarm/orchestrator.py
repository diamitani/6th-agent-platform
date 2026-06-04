import asyncio
import uuid
from datetime import datetime
from loguru import logger

from .coordinator import (
    SwarmCoordinator,
    SwarmTask,
    TaskPhase,
    TaskPriority,
    TaskStatus,
)
from .task_router import TaskRouter
from ..hub.message_bus import MessageBus
from ..hub.state_manager import StateManager


class SwarmOrchestrator:
    def __init__(
        self,
        coordinator: SwarmCoordinator = None,
        task_router: TaskRouter = None,
        message_bus: MessageBus = None,
        state_manager: StateManager = None,
    ):
        self.coordinator = coordinator or SwarmCoordinator(message_bus, state_manager)
        self.task_router = task_router or TaskRouter()
        self.message_bus = message_bus
        self.state_manager = state_manager
        self.active_runs: dict[str, dict] = {}
        self._running = False
        logger.info("SwarmOrchestrator initialized")

    async def run_product_vision(self, vision: str, project_id: str = None) -> dict:
        run_id = str(uuid.uuid4())
        logger.info(f"Starting product vision run: {run_id[:8]}")

        main_task = SwarmTask(
            id=f"vision/{run_id[:8]}",
            title="build_saas_dashboard",
            description=vision,
            phase=TaskPhase.PRE_D,
            priority=TaskPriority.HIGH,
            metadata={"project_id": project_id, "vision": vision, "run_id": run_id},
        )

        self.active_runs[run_id] = {
            "vision": vision,
            "project_id": project_id,
            "started_at": datetime.utcnow(),
            "main_task_id": main_task.id,
            "status": "running",
        }

        await self.coordinator.dispatch_task(main_task)
        subtasks = await self.task_router.route(main_task)

        for sub in subtasks:
            await self.coordinator.dispatch_task(sub)

        self.active_runs[run_id]["subtask_ids"] = [s.id for s in subtasks]
        self.active_runs[run_id]["status"] = "delegated"

        if self.message_bus:
            await self.message_bus.publish(
                "swarm.run.started",
                {
                    "run_id": run_id,
                    "vision": vision[:200],
                    "task_count": len(subtasks) + 1,
                },
            )

        return {"run_id": run_id, "main_task": main_task.id, "subtasks": len(subtasks)}

    async def orchestrate_workflow(
        self, description: str, agents: list[str] = None, project_id: str = None
    ) -> dict:
        phase = self.task_router.suggest_phase(description)
        priority = TaskPriority.MEDIUM

        task = SwarmTask(
            id=str(uuid.uuid4()),
            title=description[:60],
            description=description,
            phase=phase,
            priority=priority,
            metadata={"project_id": project_id, "requested_agents": agents or []},
        )

        await self.coordinator.dispatch_task(task)
        subtasks = await self.task_router.route(task)

        for sub in subtasks:
            agent = self._pick_agent_for_phase(sub.phase, agents)
            if agent:
                sub.assigned_agent = agent
            await self.coordinator.dispatch_task(sub)

        return {"task_id": task.id, "phase": phase.value, "subtasks": len(subtasks)}

    async def get_run_status(self, run_id: str) -> dict:
        run = self.active_runs.get(run_id, {})
        if not run:
            return {"status": "not_found"}

        task_graph = await self.coordinator.get_task_graph()
        tasks_status = {}
        for task_id in run.get("subtask_ids", []):
            task = self.coordinator.tasks.get(task_id)
            if task:
                tasks_status[task_id] = {
                    "title": task.title,
                    "status": task.status.value,
                    "agent": task.assigned_agent,
                    "phase": task.phase.value,
                }

        completed = sum(1 for t in tasks_status.values() if t["status"] == "completed")
        total = max(len(tasks_status), 1)

        run["progress"] = f"{completed}/{total}"
        run["tasks"] = tasks_status
        if completed == total and total > 0:
            run["status"] = "completed"
        elif any(t["status"] == "failed" for t in tasks_status.values()):
            run["status"] = "has_failures"

        return run

    async def list_active_runs(self) -> list[dict]:
        return [
            {
                "run_id": rid,
                "vision": r.get("vision", "")[:100],
                "status": r.get("status", ""),
                "started_at": str(r.get("started_at", "")),
            }
            for rid, r in self.active_runs.items()
        ]

    async def cancel_run(self, run_id: str):
        run = self.active_runs.get(run_id)
        if not run:
            return

        for task_id in run.get("subtask_ids", []):
            task = self.coordinator.tasks.get(task_id)
            if task and task.status not in (TaskStatus.COMPLETED, TaskStatus.FAILED):
                task.status = TaskStatus.PENDING

        run["status"] = "cancelled"
        logger.info(f"Run {run_id[:8]} cancelled")

        if self.message_bus:
            await self.message_bus.publish("swarm.run.cancelled", {"run_id": run_id})

    def _pick_agent_for_phase(
        self, phase: TaskPhase, preferred: list[str] = None
    ) -> str:
        phase_map = {
            TaskPhase.PRE_D: "product",
            TaskPhase.DESIGN: "design",
            TaskPhase.DEVELOPMENT: "development",
            TaskPhase.DEPLOYMENT: "devops",
            TaskPhase.DEBUGGING: "qa",
        }
        default = phase_map.get(phase, "engineering")
        if preferred and default in preferred:
            return default
        return preferred[0] if preferred else default
