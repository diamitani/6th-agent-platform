# 6th Agent

**ROSTR-Powered Agent Platform with DeepSeek Integration**

Build, deploy, and operate production AI agents with a Claude Console-style interface — 100% local, 100% open source.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Node](https://img.shields.io/badge/node-20+-green)

---

## What is 6th Agent?

6th Agent is a standalone application that implements the complete [ROSTR Agent Framework](https://rostr-paper.vercel.app), providing everything you need to build autonomous AI agents:

- 🤖 **Agent Builder** — Natural language → production agent in minutes
- 📁 **File Upload** — Drag & drop PDFs, code, docs → instant knowledge base
- 🔌 **Integrations** — Connect HubSpot, Slack, GitHub, APIs, MCP servers
- 🚀 **Multi-Platform Deploy** — Export to Claude Skills, OpenClaw, or standalone
- 💬 **Claude-Style Chat** — Beautiful console interface with streaming
- 🏠 **100% Local** — All LLM inference via Ollama (DeepSeek)

Built on the **ROSTR Framework:**
- **PAL** — Prompt Abstraction Layer (compiles intent into instructions)
- **RAG DAL** — Dynamic knowledge retrieval with source validation
- **NPAO** — Navigate/Prioritize/Allocate/Orchestrate (5D task routing)
- **Rostr Hub** — Persistent state, agent registry, reference architecture

---

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **Ollama** ([install](https://ollama.ai))
- **Supabase CLI** (optional, for local dev)

### 1. Install Ollama Models

```bash
# Fast inference model (7B)
ollama pull deepseek-r1:7b

# Reasoning model (32B)
ollama pull deepseek-r1:32b

# Embedding model
ollama pull nomic-embed-text
```

### 2. Clone & Install

```bash
git clone https://github.com/yourusername/6th-agent.git
cd 6th-agent

# Install backend
cd backend
pip install -r requirements.txt

# Install frontend
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your settings
# OLLAMA_HOST=http://localhost:11434
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://localhost:6379
```

### 4. Run Development Server

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Ensure Ollama is running
ollama serve
```

Visit **http://localhost:3000** 🎉

---

## Features

### 🎯 Agent Builder

Create production agents through natural language:

```
You: "I need an agent that monitors HubSpot daily and drafts follow-up emails for stale deals"

6th Agent:
  ✓ PAL extracts intent
  ✓ Generates system instructions
  ✓ Configures tools (HubSpot API, Email)
  ✓ Sets up RAG DAL knowledge base
  ✓ Creates NPAO orchestration
  ✓ Exports to multiple platforms

→ Agent ready in <30 seconds
```

### 📚 Knowledge Ingestion

Upload any files to build your agent's knowledge base:

- **Documents:** PDF, DOCX, TXT, Markdown
- **Code:** Python, JavaScript, TypeScript, etc.
- **Data:** CSV, JSON, YAML
- **Auto-chunking** → **Embedding generation** → **Vector storage**

### 🔌 Integration Connectors

Pre-built connectors for popular services:

- **CRM:** HubSpot, Salesforce
- **Communication:** Slack, Microsoft Teams, Gmail
- **Dev Tools:** GitHub, GitLab, Jira, Linear
- **MCP:** Model Context Protocol support
- **Custom APIs:** OAuth 2.0 flow handler

### 🚀 Multi-Platform Deployment

Export your agent to any platform:

1. **Standalone** — Docker container with API
2. **Claude Skill** — Works in Claude Code/Projects
3. **OpenClaw** — Full OpenClaw workspace config
4. **API Endpoint** — RESTful API deployment
5. **Codex** — Agent definition for Codex

### 📊 NPAO Task Board

Visual task management with the 5D framework:

```
[PreD] → [Design] → [Development] → [Deployment]
                                          ↓
                                    [Debugging]
```

- Auto-prioritize tasks by urgency, dependencies, impact
- Route to the right agents automatically
- Real-time updates via WebSocket

---

## Architecture

### Frontend (Next.js 15)

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── chat/              # Chat interface
│   ├── agents/            # Agent builder & management
│   ├── workspace/         # Workspace management
│   └── integrations/      # Integration connectors
├── components/
│   ├── Chat/              # Chat UI components
│   ├── AgentBuilder/      # Agent builder wizard
│   ├── FileUpload/        # File upload & display
│   └── TaskBoard/         # NPAO task board
└── lib/
    ├── api.ts             # API client
    ├── websocket.ts       # WebSocket connection
    └── types.ts           # TypeScript types
```

### Backend (FastAPI)

```
backend/
├── rostr/
│   ├── pal/               # Prompt Abstraction Layer
│   │   ├── compiler.py
│   │   ├── intent_extractor.py
│   │   ├── enhancer.py
│   │   └── router.py
│   ├── ragdal/            # Dynamic Acquisition Layer
│   │   ├── pipeline.py
│   │   ├── search_engine.py
│   │   ├── embeddings.py
│   │   └── knowledge_base.py
│   ├── npao/              # Orchestration Engine
│   │   ├── orchestrator.py
│   │   ├── navigator.py
│   │   ├── priority_scorer.py
│   │   └── allocator.py
│   ├── hub/               # Platform Core
│   │   ├── registry.py
│   │   ├── state_manager.py
│   │   ├── message_bus.py
│   │   └── reference_hub.py
│   ├── integrations/      # Connector Framework
│   │   ├── base.py
│   │   ├── oauth_manager.py
│   │   └── connectors/
│   └── agents/            # Built-in Agents
│       ├── builder.py
│       ├── researcher.py
│       └── reviewer.py
├── api/
│   ├── routes/
│   │   ├── agents.py
│   │   ├── chat.py
│   │   ├── files.py
│   │   └── integrations.py
│   └── websocket.py
└── main.py
```

---

## ROSTR Framework

### PAL (Prompt Abstraction Layer)

Compiles natural language into precise agent instructions:

1. **Extract Intent** — Analyze raw input
2. **Inject Context** — Load from Reference Hub
3. **Enhance** — Add precision and structure
4. **Compile** — Generate runtime config
5. **Route** — Send to appropriate agent

### RAG DAL (Dynamic Acquisition Layer)

Autonomous knowledge retrieval:

- **3-Tier Sources:** Academic (1.0) → Editorial (0.75) → Community (0.4)
- **Multi-Pass Search:** Broad → Gap Fill → Deep Verification
- **Confidence Scoring:** Only returns high-confidence results
- **Vector Storage:** pgvector with Nomic embeddings

### NPAO (Navigate, Prioritize, Allocate, Orchestrate)

Task routing with the 5D framework:

| Phase | Question | Output |
|-------|----------|--------|
| **PreD** | Is this worth building? | PreD Report |
| **Design** | What exactly are we building? | Design Spec |
| **Development** | Does it work? | Working Code |
| **Deployment** | Is it safe to ship? | Live Feature |
| **Debugging** | What broke and why? | Fix + Post-mortem |

**Priority Score:**
```
score = (phase_urgency × 0.35) +
        (dependency_impact × 0.30) +
        (business_impact × 0.25) +
        (resource_efficiency × 0.10)
```

### Rostr Hub (Platform Core)

Persistent state and agent management:

- **Reference Hub:** Shared context across agents
- **Agent Registry:** Directory of available agents
- **State Manager:** Session + project state
- **Message Bus:** Agent-to-agent communication
- **Namespace Manager:** Project/Org/Team isolation

---

## Why DeepSeek + Ollama?

| Feature | Cloud APIs | 6th Agent (Ollama) |
|---------|-----------|-------------------|
| **Privacy** | ❌ Data sent to cloud | ✅ 100% local |
| **Cost** | 💸 Pay per token | ✅ Free |
| **Speed** | ⏱️ Network latency | ✅ Fast (local GPU) |
| **Context** | 📏 8K-32K tokens | ✅ 32K tokens |
| **Uptime** | 🌐 Depends on API | ✅ Always available |
| **Customization** | ❌ Limited | ✅ Full control |

**DeepSeek-R1** specifically:
- MIT License (commercial use OK)
- Competitive with GPT-4 on reasoning tasks
- Optimized for M-series Macs
- Fast inference (7B model ~200ms)

---

## Examples

### Create a Research Agent

```python
from rostr import AgentBuilder

agent = AgentBuilder.from_natural_language(
    "I need an agent that researches competitors daily and generates a weekly report"
)

# PAL compiles this into:
{
    "agent_id": "competitor-research-agent",
    "primary_job": "Autonomous competitive intelligence monitoring",
    "tools": ["rag_dal", "web_search", "report_writer"],
    "schedule": "daily at 9am",
    "ragdal_config": {
        "mode": "news_sentinel",
        "tiers": ["tier_2", "tier_3"],
        "confidence_threshold": 8
    },
    "npao_phase": "PreD",
    "outputs": ["weekly_report_md"],
    "deployment": "standalone"
}

# Deploy
agent.deploy(platform="standalone")
# → Returns Docker container + API endpoint
```

### Upload Files for Knowledge Base

```typescript
// Frontend
const uploadFiles = async (files: File[]) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  
  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  })
  
  // Files are automatically:
  // 1. Parsed (PDF/DOCX/code)
  // 2. Chunked (512 tokens)
  // 3. Embedded (Nomic)
  // 4. Stored (pgvector)
  
  return response.json()
}
```

### Connect an Integration

```python
# Backend
from rostr.integrations import HubSpotConnector

connector = HubSpotConnector(
    client_id=os.getenv("HUBSPOT_CLIENT_ID"),
    client_secret=os.getenv("HUBSPOT_CLIENT_SECRET")
)

# OAuth flow
auth_url = connector.get_auth_url(redirect_uri="/api/integrations/callback")
# User completes OAuth flow
await connector.handle_callback(code=code)

# Now agents can use HubSpot
agent.add_tool(connector.as_tool())
```

---

## Deployment

### Development

```bash
# Start all services
docker-compose up
```

### Production (Docker)

```bash
# Build images
docker build -t 6th-agent-frontend:latest ./frontend
docker build -t 6th-agent-backend:latest ./backend

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud (Railway/Fly.io)

```bash
# Railway
railway up

# Fly.io
fly deploy
```

---

## Roadmap

- [x] Core ROSTR framework (PAL, RAG DAL, NPAO, Hub)
- [x] DeepSeek/Ollama integration
- [x] Claude-style dashboard
- [x] File upload & knowledge ingestion
- [x] Multi-platform agent deployment
- [ ] MCP server support
- [ ] Agent marketplace
- [ ] Team collaboration features
- [ ] Advanced RBAC
- [ ] Enterprise SSO

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT License — see [LICENSE](LICENSE)

---

## Links

- **Documentation:** [docs/](docs/)
- **ROSTR Framework:** https://rostr-paper.vercel.app
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference:** [docs/api.md](docs/api.md)

---

**Built with ❤️ by the 6th Agent team**

*Powered by the ROSTR Framework • DeepSeek • Ollama*
