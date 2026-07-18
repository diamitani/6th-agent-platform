"""
Instances API — one-stop company instance setup on AWS.

POST /api/instances/provision is the whole signup pipeline in one call:
questionnaire in → PAL org profile + ROSTR agent package + S3/DynamoDB
instance + credit grant + cost sheet out.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from rostr.tenancy.pricing import PLAN_CATALOG, estimate_monthly_cost

router = APIRouter()


def _provisioner(request: Request):
    prov = getattr(request.app.state, "tenant_provisioner", None)
    if prov is None:
        raise HTTPException(503, "Tenant provisioner not initialized")
    if not prov.enabled:
        raise HTTPException(503, "AWS credentials not configured on the platform")
    return prov


def _billing(request: Request):
    meter = getattr(request.app.state, "billing_meter", None)
    if meter is None:
        raise HTTPException(503, "Billing meter not initialized")
    return meter


class Questionnaire(BaseModel):
    """PAL onboarding intake."""

    identity: str = ""       # who you are
    offer: str = ""          # what you sell
    icp: str = ""            # who you serve
    goal: str = "sales"      # sales | marketing | operations | product
    channels: str = ""       # where you reach buyers
    stage: str = "early"     # company stage


class ProvisionRequest(BaseModel):
    company: str
    owner_email: str
    questionnaire: Questionnaire = Questionnaire()
    plan: str = "free"
    billing_mode: str = "credits"   # credits | byok
    byok: Optional[dict] = None     # {"anthropic": "sk-...", ...}


class CreditsRequest(BaseModel):
    credits: int


class EstimateRequest(BaseModel):
    tasks_per_month: int = 600
    kb_storage_gb: float = 10.0
    byok: bool = False


@router.get("/plans")
async def list_plans():
    return {"plans": PLAN_CATALOG, "credit_usd": 0.01, "markup": 1.5}


@router.post("/estimate")
async def estimate(req: EstimateRequest):
    """Cost calculator — what a tenant instance costs to run per month."""
    return estimate_monthly_cost(
        tasks_per_month=req.tasks_per_month,
        kb_storage_gb=req.kb_storage_gb,
        byok=req.byok,
    )


@router.post("/provision")
async def provision_instance(req: ProvisionRequest, request: Request):
    prov = _provisioner(request)
    try:
        return prov.provision(
            company=req.company,
            owner_email=req.owner_email,
            questionnaire=req.questionnaire.model_dump(),
            plan=req.plan,
            billing_mode=req.billing_mode,
            byok=req.byok,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(502, f"Provisioning failed: {e}")


@router.get("/")
async def list_instances(request: Request, limit: int = 50):
    prov = _provisioner(request)
    return {"items": prov.list_instances(limit=limit)}


@router.get("/{tenant_id}")
async def get_instance(tenant_id: str, request: Request):
    prov = _provisioner(request)
    item = prov.get_instance(tenant_id)
    if not item:
        raise HTTPException(404, f"Instance {tenant_id} not found")
    return item


@router.get("/{tenant_id}/usage")
async def get_usage(tenant_id: str, request: Request, limit: int = 50):
    meter = _billing(request)
    items = meter.list_usage(tenant_id, limit=limit)
    total_cost = sum(float(i.get("cost_usd", 0)) for i in items)
    total_credits = sum(int(i.get("credits_deducted", 0)) for i in items)
    return {
        "items": items,
        "totals": {
            "events": len(items),
            "cost_usd": round(total_cost, 4),
            "credits_deducted": total_credits,
            "balance": meter.get_balance(tenant_id),
        },
    }


@router.post("/{tenant_id}/credits")
async def add_credits(tenant_id: str, req: CreditsRequest, request: Request):
    """Assign platform credits (admin — backed by AWS Bedrock on our account)."""
    if req.credits <= 0:
        raise HTTPException(400, "credits must be positive")
    meter = _billing(request)
    balance = meter.add_credits(tenant_id, req.credits)
    return {"tenant_id": tenant_id, "added": req.credits, "balance": balance}
