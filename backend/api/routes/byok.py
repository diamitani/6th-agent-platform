from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class SaveConfigRequest(BaseModel):
    provider: str
    config: dict
    user_id: str = None


class ValidateKeyRequest(BaseModel):
    provider: str
    key: str


def _get_byok(request: Request):
    byok = getattr(request.app.state, "byok_manager", None)
    if not byok:
        raise HTTPException(503, "BYOK manager not initialized")
    return byok


@router.get("/providers")
async def list_providers(request: Request):
    byok = _get_byok(request)
    return byok.list_providers()


@router.get("/providers/{provider_id}")
async def get_provider(provider_id: str, request: Request):
    byok = _get_byok(request)
    result = byok.get_provider(provider_id)
    if not result:
        raise HTTPException(404, f"Provider '{provider_id}' not found")
    return result


@router.post("/validate")
async def validate_key(req: ValidateKeyRequest, request: Request):
    byok = _get_byok(request)
    return await byok.validate_key(req.provider, req.key)


@router.post("/save")
async def save_config(req: SaveConfigRequest, request: Request):
    byok = _get_byok(request)
    ok = await byok.save_config(req.provider, req.config, req.user_id)
    return {"saved": ok}


@router.get("/config")
async def get_config(request: Request, provider: str = None, user_id: str = None):
    byok = _get_byok(request)
    return await byok.get_config(provider, user_id)


@router.post("/test")
async def test_connection(request: Request, provider: str, user_id: str = None):
    byok = _get_byok(request)
    return await byok.test_connection(provider, user_id)
