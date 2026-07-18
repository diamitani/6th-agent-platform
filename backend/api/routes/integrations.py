"""Integrations API — Composio-powered tool arsenal for agents."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()


def _composio(request: Request):
    client = getattr(request.app.state, "composio_client", None)
    if client is None:
        raise HTTPException(503, "Composio client not initialized")
    return client


class ConnectRequest(BaseModel):
    toolkit_slug: str
    user_id: str
    auth_config_id: Optional[str] = None
    callback_url: Optional[str] = None


class ExecuteRequest(BaseModel):
    tool_slug: str
    arguments: dict = {}
    user_id: str
    connected_account_id: Optional[str] = None


@router.get("/status")
async def integration_status(request: Request):
    client = _composio(request)
    return {
        "provider": "composio",
        "live": client.enabled,
        "mode": "live" if client.enabled else "curated-catalog",
    }


@router.get("/toolkits")
async def list_toolkits(request: Request, limit: int = 100):
    client = _composio(request)
    return {"items": await client.list_toolkits(limit=limit)}


@router.get("/toolkits/{toolkit_slug}/tools")
async def list_tools(toolkit_slug: str, request: Request, limit: int = 50):
    client = _composio(request)
    try:
        return {"items": await client.list_tools(toolkit_slug, limit=limit)}
    except Exception as e:
        raise HTTPException(502, f"Composio tools fetch failed: {e}")


@router.post("/connect")
async def initiate_connection(req: ConnectRequest, request: Request):
    client = _composio(request)
    try:
        return await client.initiate_connection(
            toolkit_slug=req.toolkit_slug,
            user_id=req.user_id,
            auth_config_id=req.auth_config_id,
            callback_url=req.callback_url,
        )
    except Exception as e:
        raise HTTPException(502, f"Connection initiation failed: {e}")


@router.get("/connections")
async def list_connections(request: Request, user_id: Optional[str] = None):
    client = _composio(request)
    try:
        return {"items": await client.list_connections(user_id=user_id)}
    except Exception as e:
        raise HTTPException(502, f"Connections fetch failed: {e}")


@router.post("/execute")
async def execute_tool(req: ExecuteRequest, request: Request):
    client = _composio(request)
    try:
        return await client.execute_tool(
            tool_slug=req.tool_slug,
            arguments=req.arguments,
            user_id=req.user_id,
            connected_account_id=req.connected_account_id,
        )
    except Exception as e:
        raise HTTPException(502, f"Tool execution failed: {e}")
