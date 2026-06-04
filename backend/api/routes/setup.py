from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class OneClickSetupRequest(BaseModel):
    provider: str = "azure"
    name: str = "my-6th-agent"
    region: str = "us-east-1"
    channels: list[str] = []
    credentials: dict = None
    specs: dict = None


def _get_setup(request: Request):
    setup = getattr(request.app.state, "one_click_setup", None)
    if not setup:
        raise HTTPException(503, "Setup manager not initialized")
    return setup


@router.post("/start")
async def start_setup(req: OneClickSetupRequest, request: Request):
    mgr = _get_setup(request)
    return await mgr.run(req.model_dump())


@router.get("/status/{setup_id}")
async def get_setup_status(setup_id: str, request: Request):
    mgr = _get_setup(request)
    status = mgr.get_status(setup_id)
    if status.get("status") == "not_found":
        raise HTTPException(404, f"Setup {setup_id} not found")
    return status
