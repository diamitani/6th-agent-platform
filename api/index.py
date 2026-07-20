from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import sys

# Create FastAPI app
app = FastAPI(
    title="6th Agent Platform API",
    description="Modern SaaS platform for ROSTR-powered agent orchestration",
    version="2.1.0",
    openapi_url="/api/v2/openapi.json",
    docs_url="/api/v2/docs",
    redoc_url="/api/v2/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
FREE_TOKEN = "free-test-token"
FREE_TEST_USER = {
    "email": "patrick.diamitani@gmail.com",
    "name": "Test User",
    "plan": "free-forever",
    "workspace": "workspace-001"
}

# Root endpoint
@app.get("/")
async def root():
    return {
        "app": "6th Agent Platform v2.1.0",
        "version": "2.1.0",
        "docs": "/api/v2/docs",
        "free_test": "/api/v2/free-test",
        "github": "https://github.com/diamitani/6th-agent-platform",
        "vercel_url": "https://6th-agent-platform.vercel.app"
    }

# Health check
@app.get("/api/v2/health")
async def health():
    return {"status": "healthy", "platform": "6th Agent SaaS v2.1.0"}

# Free test account
@app.get("/api/v2/free-test")
async def free_test():
    return {
        "message": "Free test account for platform development",
        "special_account": FREE_TEST_USER,
        "token": FREE_TOKEN,
        "plan": "free-forever",
        "features": [
            "Up to 5 agents",
            "Basic analytics",
            "Email support",
            "1GB storage"
        ],
        "usage": "unlimited for testing"
    }

# Dashboard endpoint
@app.get("/api/v2/dashboard")
async def dashboard(authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {FREE_TOKEN}" and authorization != FREE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "user": FREE_TEST_USER,
        "overview": {
            "status": "active",
            "plan": "free-forever",
            "workspaces": 1,
            "agents": 2,
            "storage_used": "125MB/1024MB"
        },
        "metrics": {
            "total_tasks": 1247,
            "success_rate": 98.7,
            "avg_task_time": "2.4min",
            "cost_per_task": "$0.0103",
            "total_cost": "$12.89"
        },
        "recent_activity": [
            {"time": "10m ago", "action": "Research agent completed 847th task", "cost": "$0.0078"},
            {"time": "25m ago", "action": "Builder agent deployed feature", "cost": "$0.0122"},
            {"time": "1h ago", "action": "Web search executed", "cost": "$0.0031"},
            {"time": "2h ago", "action": "Analytics dashboard refreshed", "cost": "$0.0015"}
        ]
    }

# Workspaces endpoint
@app.get("/api/v2/workspaces")
async def get_workspaces(authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {FREE_TOKEN}" and authorization != FREE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "current_workspace": {
            "id": "workspace-001",
            "name": "Test Workspace",
            "owner": FREE_TEST_USER["email"],
            "plan": "free-forever",
            "members": 1,
            "created": "2026-07-20T10:00:00Z"
        },
        "workspaces": [
            {
                "id": "workspace-001",
                "name": "Test Workspace",
                "role": "admin",
                "members": 1,
                "agents": 2,
                "storage": "125MB/1024MB"
            }
        ]
    }

# Agents endpoint
@app.get("/api/v2/agents")
async def get_agents(authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {FREE_TOKEN}" and authorization != FREE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "agents": [
            {
                "id": "agent-001",
                "name": "Research Agent",
                "type": "research",
                "status": "active",
                "tasks_completed": 847,
                "success_rate": 99.2,
                "total_cost": "$8.47"
            },
            {
                "id": "agent-002",
                "name": "Builder Agent",
                "type": "builder",
                "status": "active",
                "tasks_completed": 400,
                "success_rate": 97.5,
                "total_cost": "$4.42"
            }
        ],
        "stats": {
            "total_agents": 2,
            "active_agents": 2,
            "daily_cost": "$0.215",
            "monthly_cost": "$12.89"
        }
    }

# Billing endpoint
@app.get("/api/v2/billing")
async def get_billing(authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {FREE_TOKEN}" and authorization != FREE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "plan": {
            "name": "free-forever",
            "price": "$0",
            "cycle": "monthly",
            "status": "active",
            "features": [
                "Up to 5 agents",
                "1GB storage",
                "Basic analytics",
                "Email support"
            ]
        },
        "usage": {
            "current_period": {
                "start": "2026-07-01",
                "end": "2026-07-31",
                "agents_used": 2,
                "storage_used": "125MB",
                "cost_estimate": "$0"
            },
            "cost_breakdown": {
                "aws_bedrock": "$12.89/month (estimated for paid plans)",
                "storage": "$0.42/month",
                "total": "$13.31/month"
            }
        }
    }

# Analytics endpoint
@app.get("/api/v2/analytics")
async def get_analytics(authorization: Optional[str] = Header(None)):
    if authorization != f"Bearer {FREE_TOKEN}" and authorization != FREE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "key_metrics": {
            "tasks_per_day": 42,
            "success_rate": 98.7,
            "avg_response_time": "1.8s",
            "cost_per_task": "$0.0103",
            "active_users": 1
        },
        "cost_analysis": {
            "aws_bedrock": 96.7,
            "storage": 3.3,
            "total": 100.0
        },
        "performance": {
            "research_agent": {
                "tasks": 847,
                "success": 99.2,
                "cost": "$8.47"
            },
            "builder_agent": {
                "tasks": 400,
                "success": 97.5,
                "cost": "$4.42"
            }
        }
    }

# Search endpoint
@app.post("/api/v2/search")
async def perform_search(
    query: dict,
    authorization: Optional[str] = Header(None)
):
    if authorization != f"Bearer {FREE_TOKEN}" and authorization != FREE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    search_query = query.get("query", "test")
    
    return {
        "results": [
            {
                "title": f"Search result for '{search_query}' - Modern SaaS Platform",
                "snippet": "This is a demo search result from the 6th Agent Platform's modern SaaS API.",
                "url": "https://vercel.com/deploy",
                "credibility": 0.85,
                "source_tier": 2
            },
            {
                "title": "Vercel Deployment Documentation",
                "snippet": "Learn how to deploy FastAPI applications to Vercel with Python runtime.",
                "url": "https://vercel.com/docs/functions/serverless-functions/runtimes/python",
                "credibility": 0.95,
                "source_tier": 1
            }
        ],
        "query": search_query,
        "count": 2,
        "cost": "$0.0031"
    }

# For Vercel deployment
# No __main__ needed for Vercel serverless functions