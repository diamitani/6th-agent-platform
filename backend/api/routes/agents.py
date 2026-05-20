"""Agent management API routes"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()


class CreateAgentRequest(BaseModel):
    description: str
    context: Optional[Dict[str, Any]] = None


class AgentResponse(BaseModel):
    agent_id: str
    name: str
    description: str
    status: str


@router.post("/create")
async def create_agent(request: CreateAgentRequest, app_request: Request):
    """Create new agent from natural language description"""
    try:
        # Use PAL to compile agent specification
        pal = app_request.app.state.pal_compiler
        agent_spec = await pal.compile_agent_spec(
            description=request.description,
            context=request.context
        )

        return {
            "success": True,
            "agent_spec": {
                "primary_job": agent_spec.primary_job,
                "domain": agent_spec.domain,
                "tools_needed": agent_spec.tools_needed,
                "autonomy_level": agent_spec.autonomy_level
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_agents(app_request: Request):
    """List all registered agents"""
    registry = app_request.app.state.agent_registry
    agents = registry.list_all()
    return [
        {
            "agent_id": agent.agent_id,
            "name": agent.name,
            "description": agent.description,
            "type": agent.type,
            "status": agent.status
        }
        for agent in agents
    ]


@router.get("/{agent_id}")
async def get_agent(agent_id: str, app_request: Request):
    """Get agent details"""
    registry = app_request.app.state.agent_registry
    agent = registry.get(agent_id)

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return agent.to_dict()
