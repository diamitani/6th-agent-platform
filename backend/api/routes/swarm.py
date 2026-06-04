from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from loguru import logger

router = APIRouter()


class RunVisionRequest(BaseModel):
    vision: str
    project_id: str = None


class WorkflowRequest(BaseModel):
    description: str
    agents: list[str] = None
    project_id: str = None


def _get_swarm(request: Request):
    swarm = getattr(request.app.state, "swarm_orchestrator", None)
    if not swarm:
        raise HTTPException(503, "Swarm orchestrator not initialized")
    return swarm


@router.post("/run-vision")
async def run_product_vision(req: RunVisionRequest, request: Request):
    swarm = _get_swarm(request)
    return await swarm.run_product_vision(req.vision, req.project_id)


@router.post("/workflow")
async def run_workflow(req: WorkflowRequest, request: Request):
    swarm = _get_swarm(request)
    return await swarm.orchestrate_workflow(req.description, req.agents, req.project_id)


@router.get("/runs")
async def list_runs(request: Request):
    swarm = _get_swarm(request)
    return await swarm.list_active_runs()


@router.get("/runs/{run_id}")
async def get_run_status(run_id: str, request: Request):
    swarm = _get_swarm(request)
    status = await swarm.get_run_status(run_id)
    if status.get("status") == "not_found":
        raise HTTPException(404, f"Run {run_id} not found")
    return status


@router.post("/runs/{run_id}/cancel")
async def cancel_run(run_id: str, request: Request):
    swarm = _get_swarm(request)
    await swarm.cancel_run(run_id)
    return {"cancelled": True, "run_id": run_id}


@router.get("/tasks")
async def get_task_graph(request: Request):
    swarm = _get_swarm(request)
    return await swarm.coordinator.get_task_graph()


@router.get("/agents/{agent_id}/workload")
async def get_agent_workload(agent_id: str, request: Request):
    swarm = _get_swarm(request)
    tasks = await swarm.coordinator.get_agent_workload(agent_id)
    return {
        "agent_id": agent_id,
        "workload": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "status": t.status.value,
                "phase": t.phase.value,
            }
            for t in tasks
        ],
    }
