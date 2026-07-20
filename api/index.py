from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import os
import sys
import jwt
from datetime import datetime, timedelta
import hashlib

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

# Security
security = HTTPBearer()

# JWT Secret (in production, use environment variable)
JWT_SECRET = os.getenv("JWT_SECRET", "test-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

# Mock user database (in production, use Supabase/PostgreSQL)
MOCK_USERS = {
    "patrick.diamitani@gmail.com": {
        "id": "user-001",
        "email": "patrick.diamitani@gmail.com",
        "name": "Test User",
        "password_hash": hashlib.sha256("test123".encode()).hexdigest(),  # hash of "test123"
        "plan": "free-forever",
        "workspace": "workspace-001",
        "created_at": "2026-07-01T10:00:00Z"
    }
}

def create_access_token(email: str):
    """Create JWT token for user"""
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    email = verify_token(token)
    
    if email not in MOCK_USERS:
        raise HTTPException(status_code=401, detail="User not found")
    
    return MOCK_USERS[email]

# Authentication endpoints
@app.post("/api/v2/auth/login")
async def login(request: Request):
    """Login endpoint"""
    try:
        data = await request.json()
        email = data.get("email", "").lower().strip()
        password = data.get("password", "")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Check user exists
        if email not in MOCK_USERS:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = MOCK_USERS[email]
        
        # Verify password (in production, use secure hashing)
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if password_hash != user["password_hash"]:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create JWT token
        token = create_access_token(email)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "plan": user["plan"],
                "workspace": user["workspace"]
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v2/auth/signup")
async def signup(request: Request):
    """Signup endpoint"""
    try:
        data = await request.json()
        email = data.get("email", "").lower().strip()
        password = data.get("password", "")
        name = data.get("name", "").strip()
        
        if not email or not password or not name:
            raise HTTPException(status_code=400, detail="Email, password, and name required")
        
        # Check if user already exists
        if email in MOCK_USERS:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        user_id = f"user-{len(MOCK_USERS) + 1:03d}"
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        MOCK_USERS[email] = {
            "id": user_id,
            "email": email,
            "name": name,
            "password_hash": password_hash,
            "plan": "free-forever",
            "workspace": f"workspace-{user_id}",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Create JWT token
        token = create_access_token(email)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                "plan": "free-forever",
                "workspace": f"workspace-{user_id}"
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/auth/verify")
async def verify_token_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify token endpoint"""
    token = credentials.credentials
    email = verify_token(token)
    
    if email not in MOCK_USERS:
        raise HTTPException(status_code=401, detail="User not found")
    
    user = MOCK_USERS[email]
    return {
        "valid": True,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "plan": user["plan"],
            "workspace": user["workspace"]
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "app": "6th Agent Platform v2.1.0",
        "version": "2.1.0",
        "docs": "/api/v2/docs",
        "auth": {
            "login": "/api/v2/auth/login",
            "signup": "/api/v2/auth/signup",
            "verify": "/api/v2/auth/verify"
        },
        "github": "https://github.com/diamitani/6th-agent-platform",
        "vercel_url": "https://6th-agent-platform.vercel.app"
    }

# Health check
@app.get("/api/v2/health")
async def health():
    return {"status": "healthy", "platform": "6th Agent SaaS v2.1.0"}

# Free test endpoint (for demo/quick access)
@app.get("/api/v2/free-test")
async def free_test():
    return {
        "message": "Free test account for platform development",
        "test_account": {
            "email": "patrick.diamitani@gmail.com",
            "password": "test123",
            "name": "Test User"
        },
        "note": "Use these credentials at /api/v2/auth/login",
        "endpoints": {
            "login": "POST /api/v2/auth/login",
            "signup": "POST /api/v2/auth/signup",
            "verify": "GET /api/v2/auth/verify"
        }
    }

# Protected endpoints
@app.get("/api/v2/dashboard")
async def dashboard(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "user": {
            "email": user["email"],
            "name": user["name"],
            "plan": user["plan"],
            "workspace": user["workspace"]
        },
        "overview": {
            "status": "active",
            "plan": user["plan"],
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

@app.get("/api/v2/workspaces")
async def get_workspaces(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "current_workspace": {
            "id": user["workspace"],
            "name": f"{user['name']}'s Workspace",
            "owner": user["email"],
            "plan": user["plan"],
            "members": 1,
            "created": user.get("created_at", "2026-07-20T10:00:00Z")
        },
        "workspaces": [
            {
                "id": user["workspace"],
                "name": f"{user['name']}'s Workspace",
                "role": "admin",
                "members": 1,
                "agents": 2,
                "storage": "125MB/1024MB"
            }
        ]
    }

@app.get("/api/v2/agents")
async def get_agents(user: Dict[str, Any] = Depends(get_current_user)):
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

@app.get("/api/v2/billing")
async def get_billing(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "plan": {
            "name": user["plan"],
            "price": "$0" if user["plan"] == "free-forever" else "$29/month",
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
                "cost_estimate": "$0" if user["plan"] == "free-forever" else "$13.31"
            },
            "cost_breakdown": {
                "aws_bedrock": "$12.89/month (estimated for paid plans)",
                "storage": "$0.42/month",
                "total": "$13.31/month"
            }
        }
    }

@app.get("/api/v2/analytics")
async def get_analytics(user: Dict[str, Any] = Depends(get_current_user)):
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

@app.post("/api/v2/search")
async def perform_search(
    request: Request,
    user: Dict[str, Any] = Depends(get_current_user)
):
    data = await request.json()
    search_query = data.get("query", "test")
    
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