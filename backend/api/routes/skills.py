"""Skills API — Enably GTM pack, executed through the Hermes runtime."""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from rostr.skills import ENABLY_PACK, ENABLY_SKILLS, compile_skill_prompt, get_skill

router = APIRouter()


class RunSkillRequest(BaseModel):
    skill_id: str
    values: dict[str, str] = {}
    user_id: str = "default"
    tenant_id: str | None = None      # meter usage against this tenant
    billing_mode: str = "credits"


@router.get("/")
async def list_skills():
    return {"pack": ENABLY_PACK, "items": ENABLY_SKILLS}


@router.get("/{skill_id}")
async def get_skill_detail(skill_id: str):
    skill = get_skill(skill_id)
    if not skill:
        raise HTTPException(404, f"Skill {skill_id} not found")
    return skill


@router.post("/run")
async def run_skill(req: RunSkillRequest, request: Request):
    skill = get_skill(req.skill_id)
    if not skill:
        raise HTTPException(404, f"Skill {req.skill_id} not found")

    missing = [
        i["id"]
        for i in skill["inputs"]
        if i.get("required") and not req.values.get(i["id"], "").strip()
    ]
    if missing:
        raise HTTPException(400, f"Missing required inputs: {', '.join(missing)}")

    runtime = getattr(request.app.state, "hermes_runtime", None)
    if runtime is None:
        raise HTTPException(503, "Hermes runtime not initialized")

    system, task = compile_skill_prompt(skill, req.values)
    try:
        result = await runtime.run(
            agent_id=f"skill:{skill['id']}",
            system_prompt=system,
            task=task,
            user_id=req.user_id,
            max_turns=3,
            tenant_id=req.tenant_id,
            billing_mode=req.billing_mode,
        )
    except Exception as e:
        raise HTTPException(502, f"Skill run failed: {e}")
    return result.to_dict()
