"""Tasks API — NPAO mission queue (Necessity → Anxiety → Priority → Opportunity)."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()


def _npao(request: Request):
    orchestrator = getattr(request.app.state, "npao_orchestrator", None)
    if orchestrator is None:
        raise HTTPException(503, "NPAO orchestrator not initialized")
    return orchestrator


class CreateTaskRequest(BaseModel):
    title: str
    description: str = ""
    phase: str = "development"
    npao_class: Optional[str] = None  # auto-classified when omitted
    blocks_downstream: bool = False
    business_impact: float = 5.0
    resource_efficiency: float = 5.0
    assigned_agent: Optional[str] = None


class UpdateStatusRequest(BaseModel):
    status: str  # queued | active | done | cancelled


@router.post("/")
async def create_task(req: CreateTaskRequest, request: Request):
    npao = _npao(request)
    try:
        task = npao.add_task(
            title=req.title,
            description=req.description,
            phase=req.phase,
            npao_class=req.npao_class,
            blocks_downstream=req.blocks_downstream,
            business_impact=req.business_impact,
            resource_efficiency=req.resource_efficiency,
            assigned_agent=req.assigned_agent,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    return task.to_dict()


@router.get("/")
async def list_tasks(request: Request, include_done: bool = True):
    npao = _npao(request)
    return {"items": [t.to_dict() for t in npao.execution_queue(include_done=include_done)]}


@router.get("/canvas")
async def npao_canvas(request: Request):
    """The four-column NPAO Canvas, in N → A → P → O execution order."""
    npao = _npao(request)
    return {"columns": npao.canvas(), "stats": npao.stats()}


@router.get("/next")
async def next_task(request: Request):
    npao = _npao(request)
    task = npao.next_task()
    return {"task": task.to_dict() if task else None}


@router.get("/stats")
async def task_stats(request: Request):
    return _npao(request).stats()


@router.patch("/{task_id}/status")
async def update_task_status(task_id: str, req: UpdateStatusRequest, request: Request):
    npao = _npao(request)
    task = npao.update_status(task_id, req.status)
    if task is None:
        raise HTTPException(404, f"Task {task_id} not found")
    return task.to_dict()


@router.delete("/{task_id}")
async def delete_task(task_id: str, request: Request):
    npao = _npao(request)
    if not npao.remove_task(task_id):
        raise HTTPException(404, f"Task {task_id} not found")
    return {"deleted": True, "task_id": task_id}
