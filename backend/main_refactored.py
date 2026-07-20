"""
6th Agent Platform - Modern SaaS Backend
ROSTR-Powered Multi-Tenant Agent Orchestration
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import OAuth2PasswordBearer
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from loguru import logger
from typing import Optional

# Load environment variables
load_dotenv()

# Configure logging
logger.add(
    "logs/6th-agent.log",
    rotation="500 MB",
    retention="10 days",
    level=os.getenv("LOG_LEVEL", "INFO"),
)

# Initialize core ROSTR components
from rostr.hub.registry import AgentRegistry
from rostr.hub.state_manager import StateManager
from rostr.hub.message_bus import MessageBus
from rostr.pal.compiler import PALCompiler
from rostr.ragdal.pipeline import RAGDALPipeline
from rostr.npao.orchestrator import NPAOOrchestrator
from rostr.swarm.orchestrator import SwarmOrchestrator

# Core platform modules (defer imports to avoid circular issues)

# Platform configuration
PLATFORM_NAME = "6th Agent"
PLATFORM_VERSION = "2.0.0"
SUPPORT_EMAIL = "support@6thagent.com"
API_PREFIX = "/api/v2"

# Free forever test account
FREE_TEST_USER = "patrick.diamitani@gmail.com"

# Authentication scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{API_PREFIX}/auth/login")


def init_platform():
    """Initialize platform core dependencies"""
    # Initialize ROSTR components
    agent_registry = AgentRegistry()
    state_manager = StateManager()
    message_bus = MessageBus()
    pal_compiler = PALCompiler()
    ragdal_pipeline = RAGDALPipeline()
    npao_orchestrator = NPAOOrchestrator()
    swarm_orchestrator = SwarmOrchestrator()
    
    return {
        "agent_registry": agent_registry,
        "state_manager": state_manager,
        "message_bus": message_bus,
        "pal_compiler": pal_compiler,
        "ragdal_pipeline": ragdal_pipeline,
        "npao_orchestrator": npao_orchestrator,
        "swarm_orchestrator": swarm_orchestrator,
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan manager for startup/shutdown events"""
    logger.info(f"🚀 Starting {PLATFORM_NAME} v{PLATFORM_VERSION}")
    
    # Initialize platform
    app.state.platform = init_platform()
    
    # Create default workspace for free test user
    app.state.free_test_account = {
        "email": FREE_TEST_USER,
        "workspace_id": "free-workspace-001",
        "plan": "free-forever",
        "features": ["unlimited-agents", "basic-analytics", "email-support"]
    }
    
    logger.info(f"✅ Platform initialized with free test account: {FREE_TEST_USER}")
    yield
    
    # Cleanup on shutdown
    logger.info(f"🛑 Shutting down {PLATFORM_NAME}")
    # Cleanup ROSTR components if needed


# Create FastAPI app with lifespan
app = FastAPI(
    title=PLATFORM_NAME,
    version=PLATFORM_VERSION,
    description="Modern SaaS Platform for ROSTR-Powered Agent Orchestration",
    contact={
        "name": "Platform Support",
        "email": SUPPORT_EMAIL,
    },
    license_info={
        "name": "Commercial",
        "url": "https://6thagent.com/terms",
    },
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,https://app.6thagent.com").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Dependency for protected routes
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT token and return user"""
    # Simplified auth for demo
    # In production, this would validate JWT and fetch user from DB
    if token == "free-test-token":
        return {
            "id": "user-free-001",
            "email": FREE_TEST_USER,
            "name": "Pat Diamitani",
            "plan": "free-forever",
            "workspace_id": "free-workspace-001",
            "permissions": ["agent:create", "workspace:read", "billing:read"]
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials"
    )


# Register API routes with version prefix
# Import routers directly to avoid circular imports


# Health and root endpoints
@app.get("/")
async def root():
    """Root endpoint with platform info"""
    return {
        "platform": PLATFORM_NAME,
        "version": PLATFORM_VERSION,
        "description": "Modern SaaS Platform for ROSTR-Powered Agent Orchestration",
        "contact": SUPPORT_EMAIL,
        "docs": f"{API_PREFIX}/docs",
        "health": f"{API_PREFIX}/health",
    }


@app.get(f"{API_PREFIX}/health")
async def health_check():
    """Comprehensive health check"""
    platform_state = app.state.platform if hasattr(app.state, 'platform') else {}
    
    return {
        "status": "healthy",
        "components": {
            "api": "✅",
            "auth": "✅",
            "database": "✅",  # Placeholder
            "rostr_framework": "✅" if platform_state else "⚠️",
            "aws_bedrock": "✅" if os.getenv("AWS_BEDROCK_API_KEY") else "❌",
            "stripe": "✅" if os.getenv("STRIPE_API_KEY") else "❌",
        },
        "memory_usage": "placeholder",  # Add memory tracking
        "uptime": "placeholder",  # Add uptime tracking
    }


@app.get(f"{API_PREFIX}/free-test")
async def free_test_account():
    """Free forever test account details"""
    if hasattr(app.state, 'free_test_account'):
        return {
            "message": "Free test account available",
            "account": app.state.free_test_account,
            "access_instructions": [
                "Use token: 'free-test-token' in Authorization header",
                f"Access workspace: {app.state.free_test_account['workspace_id']}",
                "Features: unlimited basic agents, basic analytics, email support"
            ]
        }
    return {"message": "Platform still initializing"}


# Platform usage analytics
@app.get(f"{API_PREFIX}/stats")
async def platform_stats():
    """Platform statistics"""
    return {
        "active_users": "placeholder",
        "agents_running": "placeholder",
        "tasks_completed": "placeholder",
        "api_requests": "placeholder",
        "storage_used": "placeholder",
    }


# WebSocket for real-time agent communication
from fastapi import WebSocket, WebSocketDisconnect
@app.websocket(f"{API_PREFIX}/ws/chat/{{session_id}}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time chat streaming"""
    await websocket.accept()
    logger.info(f"WebSocket connected: {session_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            # Process incoming messages
            logger.info(f"Message received on session {session_id}: {data[:100]}")
            
            # Echo back for now
            await websocket.send_text(f"Received: {data}")
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_refactored:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )