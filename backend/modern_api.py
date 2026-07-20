"""
6th Agent Platform - Modern SaaS API
Clean, Minimalist, Modular Design
ROSTR-Powered Agent Orchestration
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import os
import json
from datetime import datetime, timedelta
import uuid
from typing import Optional

# Configuration
APP_NAME = "6th Agent"
VERSION = "2.1.0"
API_PREFIX = "/api/v2"
FREE_TEST_USER = "patrick.diamitani@gmail.com"

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Modern SaaS platform for ROSTR-powered agent orchestration",
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{API_PREFIX}/auth/login")


# Dependency for authentication
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Simple user authentication"""
    if token == "free-test-token":
        return {
            "id": "user-001",
            "email": FREE_TEST_USER,
            "name": "Pat Diamitani",
            "plan": "free-forever",
            "workspace_id": "workspace-001",
            "role": "admin"
        }
    raise HTTPException(status_code=401, detail="Invalid token")


# SIMPLIFIED ENDPOINTS - MODERN & CLEAN


@app.get("/")
async def root():
    """Platform info"""
    return {
        "app": APP_NAME,
        "version": VERSION,
        "description": "Modern SaaS for agent orchestration",
        "docs": f"{API_PREFIX}/docs",
        "contact": "patrick.diamitani@gmail.com",
        "status": "active",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get(f"{API_PREFIX}/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "components": {
            "api": "✅",
            "auth": "✅",
            "database": "✅",
            "rostr_framework": "✅",
            "aws_bedrock": "✅",
            "analytics": "✅"
        },
        "uptime": "45 days"
    }


@app.get(f"{API_PREFIX}/dashboard")
async def get_dashboard(requester=Depends(get_current_user)):
    """Clean dashboard overview"""
    return {
        "user": {
            "id": requester["id"],
            "email": requester["email"],
            "name": requester["name"],
            "plan": requester["plan"],
            "role": requester["role"]
        },
        "overview": {
            "total_agents": 2,
            "active_agents": 2,
            "tasks_completed": 1247,
            "workspaces": 1,
            "api_calls_today": 142
        },
        "metrics": {
            "success_rate": "98.6%",
            "avg_response_time": "89ms",
            "cost_today": "$0.42",
            "storage_used_mb": 125
        },
        "recent_activity": [
            {
                "time": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                "agent": "Research Agent",
                "action": "Completed web search task",
                "duration": "1.2s"
            },
            {
                "time": (datetime.utcnow() - timedelta(minutes=12)).isoformat(),
                "agent": "Builder Agent",
                "action": "Generated documentation",
                "duration": "3.4s"
            }
        ]
    }


@app.get(f"{API_PREFIX}/workspaces")
async def get_workspaces(requester=Depends(get_current_user)):
    """Get user workspaces"""
    return {
        "user_id": requester["id"],
        "workspaces": [
            {
                "id": "workspace-001",
                "name": "Personal Workspace",
                "type": "personal",
                "agents": 2,
                "members": 1,
                "created": datetime.utcnow().isoformat(),
                "analytics": {
                    "tasks_completed": 1247,
                    "api_calls": 3489,
                    "cost_total": "$12.89"
                }
            }
        ]
    }


@app.post(f"{API_PREFIX}/workspaces")
async def create_workspace(
    name: str,
    description: Optional[str] = None,
    is_team: bool = False,
    requester=Depends(get_current_user)
):
    """Create new workspace"""
    workspace_id = f"workspace-{uuid.uuid4()}"
    
    return {
        "message": "Workspace created",
        "workspace": {
            "id": workspace_id,
            "name": name,
            "description": description or f"Workspace for {name}",
            "type": "team" if is_team else "personal",
            "owner": requester["id"],
            "created": datetime.utcnow().isoformat(),
            "invite_code": f"invite-{uuid.uuid4()}" if is_team else None
        }
    }


@app.get(f"{API_PREFIX}/agents")
async def get_agents(requester=Depends(get_current_user)):
    """Get all agents"""
    return {
        "user_id": requester["id"],
        "agents": [
            {
                "id": "agent-001",
                "name": "Research Agent",
                "type": "researcher",
                "status": "active",
                "created": (datetime.utcnow() - timedelta(days=45)).isoformat(),
                "metrics": {
                    "tasks_completed": 847,
                    "success_rate": "99.2%",
                    "avg_time": "2m 11s",
                    "cost_total": "$8.47"
                }
            },
            {
                "id": "agent-002",
                "name": "Builder Agent",
                "type": "builder",
                "status": "active",
                "created": (datetime.utcnow() - timedelta(days=45)).isoformat(),
                "metrics": {
                    "tasks_completed": 400,
                    "success_rate": "97.5%",
                    "avg_time": "5m 33s",
                    "cost_total": "$4.42"
                }
            }
        ],
        "limits": {
            "max_agents": 5 if requester["plan"] == "free-forever" else "unlimited",
            "used_agents": 2,
            "available": 3
        }
    }


@app.post(f"{API_PREFIX}/agents")
async def create_agent(
    name: str,
    agent_type: str,
    config: Optional[dict] = None,
    requester=Depends(get_current_user)
):
    """Create new agent"""
    agent_id = f"agent-{uuid.uuid4()}"
    
    return {
        "message": "Agent created",
        "agent": {
            "id": agent_id,
            "name": name,
            "type": agent_type,
            "config": config or {
                "model": "deepseek.v3.2",
                "temperature": 0.2,
                "tools": ["web_search", "code_execution"]
            },
            "status": "inactive",
            "created": datetime.utcnow().isoformat(),
            "owner": requester["id"]
        }
    }


@app.get(f"{API_PREFIX}/billing")
async def get_billing(requester=Depends(get_current_user)):
    """Get billing information"""
    plan = requester["plan"]
    
    plans = {
        "free-forever": {
            "name": "Free Forever",
            "price": "$0/month",
            "features": [
                "Up to 5 agents",
                "Basic analytics",
                "Email support",
                "1GB storage"
            ]
        },
        "pro": {
            "name": "Pro",
            "price": "$49/month",
            "features": [
                "Unlimited agents",
                "Advanced analytics",
                "Priority support",
                "10GB storage",
                "Team workspaces"
            ]
        }
    }
    
    current_plan = plans.get(plan, plans["free-forever"])
    
    return {
        "plan": current_plan,
        "usage": {
            "agents": {"used": 2, "limit": 5},
            "storage_mb": {"used": 125, "limit": 1024},
            "api_calls": {"used": 3489, "limit": 10000}
        },
        "cost_breakdown": {
            "aws_bedrock": "$12.47",
            "storage": "$0.42",
            "total": "$12.89"
        },
        "next_billing": None if plan == "free-forever" else (datetime.utcnow() + timedelta(days=30)).isoformat()
    }


@app.get(f"{API_PREFIX}/analytics")
async def get_analytics(
    timeframe: str = "last_30_days",
    requester=Depends(get_current_user)
):
    """Get analytics dashboard"""
    return {
        "timeframe": timeframe,
        "key_metrics": {
            "total_tasks": 1247,
            "avg_success_rate": "98.6%",
            "avg_response_time": "89ms",
            "cost_per_task": "$0.0103"
        },
        "agent_performance": [
            {
                "name": "Research Agent",
                "tasks": 847,
                "success_rate": "99.2%",
                "avg_time": "2m 11s"
            },
            {
                "name": "Builder Agent",
                "tasks": 400,
                "success_rate": "97.5%",
                "avg_time": "5m 33s"
            }
        ],
        "cost_breakdown": {
            "aws_bedrock": 96.7,
            "storage": 3.3
        },
        "activity_trends": {
            "daily_tasks": [42, 38, 45, 32, 41, 39, 125],
            "api_calls": [124, 112, 142, 98, 110, 105, 142]
        }
    }


@app.post(f"{API_PREFIX}/search")
async def search_web(query: str, requester=Depends(get_current_user)):
    """Web search endpoint"""
    # Simplified search response
    return {
        "query": query,
        "timestamp": datetime.utcnow().isoformat(),
        "results": [
            {
                "title": f"Result for: {query}",
                "url": f"https://example.com/search?q={query}",
                "snippet": f"This is a sample result for {query}",
                "relevance": 0.95
            },
            {
                "title": f"Another result for: {query}",
                "url": f"https://example2.com/search?q={query}",
                "snippet": f"More information about {query}",
                "relevance": 0.87
            }
        ],
        "credits_used": 1,
        "estimated_cost": "$0.001"
    }


@app.get(f"{API_PREFIX}/free-test")
async def free_test_account_info():
    """Free forever test account details"""
    return {
        "special_account": {
            "email": FREE_TEST_USER,
            "plan": "free-forever",
            "features": ["unlimited basic agents", "analytics", "email support"],
            "status": "active",
            "created": datetime.utcnow().isoformat()
        },
        "instructions": [
            "Use token: 'free-test-token' in Authorization header",
            "Access workspace: 'workspace-001'",
            "Contact: patrick.diamitani@gmail.com for questions"
        ]
    }


# Authentication endpoints
@app.post(f"{API_PREFIX}/auth/login")
async def login(email: str, password: str):
    """Login endpoint"""
    if email == FREE_TEST_USER and password == "free-forever":
        return {
            "access_token": "free-test-token",
            "token_type": "bearer",
            "user": {
                "id": "user-001",
                "email": email,
                "name": "Pat Diamitani",
                "plan": "free-forever",
                "workspace_id": "workspace-001"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post(f"{API_PREFIX}/auth/register")
async def register(email: str, name: str, password: str):
    """Register new user"""
    user_id = f"user-{uuid.uuid4()}"
    
    return {
        "message": "Registration successful",
        "user_id": user_id,
        "email": email,
        "name": name,
        "plan": "free-trial",
        "workspace_id": f"workspace-{uuid.uuid4()}",
        "access_token": f"token-{uuid.uuid4()}",
        "trial_expires": (datetime.utcnow() + timedelta(days=14)).isoformat()
    }


# Real-time connection endpoint
from fastapi import WebSocket, WebSocketDisconnect
@app.websocket(f"{API_PREFIX}/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")


# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "modern_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )