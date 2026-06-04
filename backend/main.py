"""
6th Agent Backend - Main FastAPI Application
ROSTR-Powered Agent Platform with DeepSeek Integration
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from loguru import logger

from api.routes import (
    agents,
    chat,
    files,
    integrations,
    workspaces,
    tasks,
    swarm,
    channels,
    cloud_instances,
    byok,
    setup,
)
from rostr.hub.registry import AgentRegistry
from rostr.hub.state_manager import StateManager
from rostr.hub.message_bus import MessageBus
from rostr.pal.compiler import PALCompiler
from rostr.ragdal.pipeline import RAGDALPipeline
from rostr.npao.orchestrator import NPAOOrchestrator
from rostr.swarm.orchestrator import SwarmOrchestrator
from rostr.channels.manager import ChannelManager
from rostr.cloud.manager import CloudInstanceManager
from rostr.setup.byok import BYOKManager
from rostr.setup.one_click import OneClickSetup

# Load environment variables
load_dotenv()

# Configure logging
logger.add(
    "logs/6th-agent.log",
    rotation="500 MB",
    retention="10 days",
    level=os.getenv("LOG_LEVEL", "INFO"),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting 6th Agent Backend...")

    # Initialize ROSTR components
    message_bus = MessageBus()
    state_manager = StateManager()
    agent_registry = AgentRegistry()

    app.state.agent_registry = agent_registry
    app.state.state_manager = state_manager
    app.state.message_bus = message_bus
    app.state.pal_compiler = PALCompiler()
    app.state.ragdal_pipeline = RAGDALPipeline()
    app.state.npao_orchestrator = NPAOOrchestrator()

    # Initialize Swarm, Channels, Cloud managers
    app.state.swarm_orchestrator = SwarmOrchestrator(
        message_bus=message_bus,
        state_manager=state_manager,
    )
    app.state.channel_manager = ChannelManager(message_bus=message_bus)
    app.state.cloud_manager = CloudInstanceManager(message_bus=message_bus)
    app.state.byok_manager = BYOKManager(message_bus=message_bus)
    app.state.one_click_setup = OneClickSetup(
        cloud_manager=app.state.cloud_manager,
        channel_manager=app.state.channel_manager,
        message_bus=message_bus,
    )

    # Register 10 master agents in the agent registry
    from rostr.hub.registry import AgentRegistration, AgentCapability
    from rostr.agents import MASTER_AGENTS

    for agent_id, agent_cls in MASTER_AGENTS.items():
        try:
            inst = agent_cls()
            agent_registry.register(
                AgentRegistration(
                    agent_id=inst.id,
                    name=inst.name,
                    description=inst.system_instructions[:100],
                    type=inst.domain,
                    capabilities=[AgentCapability(inst.id, inst.name)],
                    tools=[],
                    phases=[inst.id],
                    model=getattr(inst, "model", "deepseek-r1:7b"),
                    context_requirements=[],
                    output_formats=["markdown"],
                )
            )
        except Exception as e:
            logger.warning(f"Failed to register agent {agent_id}: {e}")

    # Check Ollama connection
    try:
        from rostr.llm.ollama_client import OllamaClient

        ollama = OllamaClient()
        models = await ollama.list_models()
        logger.info(f"✅ Ollama connected. Available models: {models}")
    except Exception as e:
        logger.warning(f"⚠️ Ollama connection failed: {e}")

    logger.info("✅ 6th Agent Backend started successfully")

    yield

    # Shutdown
    logger.info("👋 Shutting down 6th Agent Backend...")
    await app.state.message_bus.close()
    logger.info("✅ Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="6th Agent API",
    description="ROSTR-Powered Agent Platform with DeepSeek Integration",
    version="1.0.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Routes
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(
    integrations.router, prefix="/api/integrations", tags=["Integrations"]
)
app.include_router(workspaces.router, prefix="/api/workspaces", tags=["Workspaces"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(swarm.router, prefix="/api/swarm", tags=["Swarm"])
app.include_router(channels.router, prefix="/api/channels", tags=["Channels"])
app.include_router(cloud_instances.router, prefix="/api/cloud", tags=["Cloud"])
app.include_router(byok.router, prefix="/api/byok", tags=["BYOK"])
app.include_router(setup.router, prefix="/api/setup", tags=["Setup"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "6th Agent API",
        "version": "1.0.0",
        "description": "ROSTR-Powered Agent Platform",
        "framework": {
            "PAL": "Prompt Abstraction Layer",
            "RAG_DAL": "Dynamic Acquisition Layer",
            "NPAO": "Navigate, Prioritize, Allocate, Orchestrate",
            "Hub": "Agent OS & Reference Hub",
        },
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "components": {
            "api": "ok",
            "database": "ok",  # TODO: Add actual DB check
            "redis": "ok",  # TODO: Add actual Redis check
            "ollama": "ok",  # TODO: Add actual Ollama check
        },
    }


@app.websocket("/ws/chat/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for chat streaming"""
    await websocket.accept()
    logger.info(f"WebSocket connected: {session_id}")

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            # Process with PAL + Ollama
            message = data.get("message", "")

            # Compile with PAL
            compiled = await app.state.pal_compiler.compile(
                raw_input=message, context={"session_id": session_id}
            )

            # Stream response
            from rostr.llm.ollama_client import OllamaClient

            ollama = OllamaClient()

            async for chunk in ollama.generate_stream(
                model=os.getenv("OLLAMA_FAST_MODEL", "deepseek-r1:7b"),
                prompt=compiled.enhanced_prompt,
                system=compiled.system_prompt,
            ):
                await websocket.send_json(
                    {"type": "chunk", "content": chunk, "session_id": session_id}
                )

            # Send completion
            await websocket.send_json({"type": "complete", "session_id": session_id})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
