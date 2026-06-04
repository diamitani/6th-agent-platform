from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from loguru import logger

router = APIRouter()


class ProvisionRequest(BaseModel):
    provider: str
    name: str = "6th-agent-instance"
    region: str = "us-east-1"
    specs: dict = None
    use_existing: bool = False


class TerminateRequest(BaseModel):
    instance_id: str


class ConnectProviderRequest(BaseModel):
    provider: str
    credentials: dict = None


def _get_manager(request: Request):
    mgr = getattr(request.app.state, "cloud_manager", None)
    if not mgr:
        raise HTTPException(503, "Cloud manager not initialized")
    return mgr


@router.post("/providers/connect")
async def connect_provider(req: ConnectProviderRequest, request: Request):
    mgr = _get_manager(request)
    ok = await mgr.connect_provider(req.provider, req.credentials)
    if not ok:
        raise HTTPException(400, f"Failed to connect {req.provider}")
    return {"connected": True, "provider": req.provider}


@router.post("/provision")
async def provision_instance(req: ProvisionRequest, request: Request):
    mgr = _get_manager(request)
    return await mgr.provision(
        req.provider, req.name, req.region, req.specs, req.use_existing
    )


@router.post("/terminate")
async def terminate_instance(req: TerminateRequest, request: Request):
    mgr = _get_manager(request)
    ok = await mgr.terminate(req.instance_id)
    if not ok:
        raise HTTPException(404, f"Instance {req.instance_id} not found")
    return {"terminated": True, "instance_id": req.instance_id}


@router.get("/instances")
async def list_instances(request: Request):
    mgr = _get_manager(request)
    return await mgr.list_instances()


@router.get("/instances/{instance_id}")
async def get_instance(instance_id: str, request: Request):
    mgr = _get_manager(request)
    inst = await mgr.get_instance(instance_id)
    if not inst:
        raise HTTPException(404, f"Instance {instance_id} not found")
    return inst


@router.get("/pricing")
async def get_pricing(
    request: Request, provider: str = None, region: str = "us-east-1"
):
    mgr = _get_manager(request)
    return await mgr.get_pricing(provider, region)


@router.get("/affiliate-links")
async def get_affiliate_links(request: Request):
    mgr = _get_manager(request)
    return await mgr.get_affiliate_links()


@router.get("/deployment-script")
async def get_deployment_script(request: Request):
    mgr = _get_manager(request)
    return {"script": mgr.get_deployment_script()}


@router.get("/guided-signup/{provider}")
async def guided_signup(provider: str, request: Request):
    mgr = _get_manager(request)
    url = await mgr.get_guided_signup_url(provider)
    if not url:
        raise HTTPException(404, f"No signup URL for {provider}")
    return {
        "provider": provider,
        "signup_url": url,
        "steps": [
            "1. Click the signup link to create your free account",
            "2. Set up billing (most offer free credits)",
            "3. Generate API credentials in your cloud console",
            "4. Come back here and paste your credentials",
            "5. Click 'Connect' to link your cloud account",
            "6. Deploy 6th Agent with one click!",
        ],
    }
