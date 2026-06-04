from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from loguru import logger

router = APIRouter()


class ConnectRequest(BaseModel):
    channels: list[str] = ["whatsapp", "signal", "slack", "teams"]


class SendRequest(BaseModel):
    channel: str
    recipient: str
    text: str


class BroadcastRequest(BaseModel):
    text: str
    channels: list[str] = None


def _get_manager(request: Request):
    mgr = getattr(request.app.state, "channel_manager", None)
    if not mgr:
        raise HTTPException(503, "Channel manager not initialized")
    return mgr


@router.post("/connect")
async def connect_channels(req: ConnectRequest, request: Request):
    mgr = _get_manager(request)
    results = await mgr.connect_all(req.channels)
    return {"connected": results}


@router.post("/disconnect")
async def disconnect_channels(request: Request):
    mgr = _get_manager(request)
    await mgr.disconnect_all()
    return {"status": "disconnected"}


@router.post("/send")
async def send_message(req: SendRequest, request: Request):
    mgr = _get_manager(request)
    ok = await mgr.send_to(req.channel, req.recipient, req.text)
    if not ok:
        raise HTTPException(502, f"Failed to send on {req.channel}")
    return {"sent": True, "channel": req.channel, "recipient": req.recipient}


@router.post("/broadcast")
async def broadcast_message(req: BroadcastRequest, request: Request):
    mgr = _get_manager(request)
    results = await mgr.broadcast(req.text, req.channels)
    return {"results": results}


@router.get("/status")
async def channel_status(request: Request):
    mgr = _get_manager(request)
    return {
        "channels": mgr.get_status(),
        "connected_count": mgr.get_connected_count(),
    }


@router.get("/health")
async def channel_health(request: Request):
    mgr = _get_manager(request)
    return await mgr.health_all()
