# Getting Started with 6th Agent

**Complete setup guide from zero to running agent platform**

---

## Prerequisites

Before you begin, ensure you have:

- **macOS, Linux, or Windows** (WSL2)
- **Python 3.11+** ([install](https://www.python.org/downloads/))
- **Node.js 20+** ([install](https://nodejs.org/))
- **Ollama** ([install](https://ollama.ai))
- **Git**
- **Docker** (optional, for containerized deployment)

---

## Step 1: Install Ollama & Models

### 1.1 Install Ollama

```bash
# macOS/Linux
curl https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai/download
```

### 1.2 Pull DeepSeek Models

```bash
# Fast inference model (7B) - Used for PAL, quick tasks
ollama pull deepseek-r1:7b

# Reasoning model (32B) - Used for complex planning
ollama pull deepseek-r1:32b

# Embedding model - Used for vector search
ollama pull nomic-embed-text
```

### 1.3 Verify Installation

```bash
ollama list
# Should show:
# NAME                  ID              SIZE      MODIFIED
# deepseek-r1:7b        ...             4.7 GB    ...
# deepseek-r1:32b       ...             19 GB     ...
# nomic-embed-text      ...             274 MB    ...
```

---

## Step 2: Clone & Setup

### 2.1 Clone Repository

```bash
git clone https://github.com/yourusername/6th-agent.git
cd 6th-agent
```

### 2.2 Setup Backend

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 2.3 Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

---

## Step 3: Configure Environment

### 3.1 Backend Configuration

Edit `backend/.env`:

```bash
# Ollama (should work out of the box)
OLLAMA_HOST=http://localhost:11434
OLLAMA_FAST_MODEL=deepseek-r1:7b
OLLAMA_REASONING_MODEL=deepseek-r1:32b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# For minimal setup, you can use SQLite (no external DB needed)
DATABASE_URL=sqlite:///./6th_agent.db

# Redis (optional for development)
REDIS_URL=redis://localhost:6379/0

# JWT Secret (generate your own!)
JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")

# CORS (frontend URL)
ALLOWED_ORIGINS=http://localhost:3000
```

### 3.2 Frontend Configuration

Edit `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Step 4: Start Services

### Option A: Manual (Development)

**Terminal 1: Start Ollama**
```bash
ollama serve
# Keep this running
```

**Terminal 2: Start Backend**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
# API will be available at http://localhost:8000
```

**Terminal 3: Start Frontend**
```bash
cd frontend
npm run dev
# Dashboard will be available at http://localhost:3000
```

### Option B: Docker Compose (Production-like)

```bash
# Start all services
docker-compose up

# Or in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Step 5: Verify Installation

### 5.1 Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "components": {
    "api": "ok",
    "database": "ok",
    "redis": "ok",
    "ollama": "ok"
  }
}
```

### 5.2 Check Ollama Integration

```bash
curl http://localhost:8000/api/agents/
```

Should return list of registered agents.

### 5.3 Open Dashboard

Navigate to **http://localhost:3000**

You should see the 6th Agent dashboard.

---

## Step 6: Create Your First Agent

### Via Dashboard (Recommended)

1. Go to http://localhost:3000
2. Click **"Create Agent"**
3. Describe your agent in natural language:
   ```
   I need an agent that monitors my GitHub repos
   and creates daily summary reports
   ```
4. Review the PAL-compiled specification
5. Click **"Deploy"**

### Via API

```bash
curl -X POST http://localhost:8000/api/agents/create \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I need a research agent that analyzes competitor pricing daily"
  }'
```

### Via Python SDK

```python
from rostr import AgentBuilder

# Create agent from natural language
agent = await AgentBuilder.from_description(
    "I need an agent that drafts personalized emails for stale deals"
)

# Deploy
await agent.deploy(platform="standalone")
```

---

## Step 7: Test the System

### Test PAL Compilation

```python
import asyncio
from rostr.pal.compiler import PALCompiler

async def test_pal():
    pal = PALCompiler()

    # Test intent extraction
    compiled = await pal.compile(
        raw_input="Build a pricing page for my SaaS product",
        context={}
    )

    print(f"Intent: {compiled.intent.primary_intent}")
    print(f"Domain: {compiled.intent.domain}")
    print(f"Route to: {compiled.route_to}")
    print(f"Enhanced: {compiled.enhanced_prompt}")

asyncio.run(test_pal())
```

### Test Chat Interface

```bash
# Start WebSocket chat
wscat -c ws://localhost:8000/ws/chat/test-session

# Send message
{"message": "What's the competitive landscape for project management tools?"}

# Receive streaming response
```

---

## Common Issues & Solutions

### Issue: Ollama not found

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### Issue: Models not pulling

```bash
# Check disk space (DeepSeek-32B needs ~20GB)
df -h

# Pull models one at a time
ollama pull deepseek-r1:7b
```

### Issue: Port already in use

```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :11434 # Ollama

# Kill the process or change the port in .env
```

### Issue: Import errors in Python

```bash
# Ensure you're in the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## Next Steps

✅ **System is running!** Here's what to explore:

1. **Build Agents** → Create custom agents for your workflow
2. **Upload Files** → Build knowledge bases from PDFs, docs
3. **Connect Integrations** → Link HubSpot, Slack, GitHub
4. **Deploy Agents** → Export to Claude Skills, OpenClaw
5. **Monitor Tasks** → Watch the NPAO orchestration board

---

## Development Workflow

### Running Tests

```bash
cd backend
pytest tests/

cd ../frontend
npm test
```

### Code Quality

```bash
# Backend
black .
ruff check .
mypy .

# Frontend
npm run lint
npm run type-check
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

## Architecture Overview

**6th Agent Stack:**

```
┌─────────────────┐
│  Next.js 15     │  ← Frontend (Dashboard)
│  (localhost:3000)│
└────────┬────────┘
         │ HTTP/WebSocket
┌────────▼────────┐
│  FastAPI        │  ← Backend (API)
│  (localhost:8000)│
└────────┬────────┘
         │
    ┌────▼────┐  ┌─────────┐  ┌──────┐
    │ Ollama  │  │PostgreSQL│  │Redis │
    │  :11434 │  │   :5432  │  │ :6379│
    └─────────┘  └─────────┘  └──────┘
```

**ROSTR Framework:**

- **PAL** → Compiles intent into instructions
- **RAG DAL** → Knowledge retrieval pipeline
- **NPAO** → Task routing (5D phases)
- **Hub** → State management & agent registry

---

## Resources

- **Documentation:** `docs/`
- **API Reference:** http://localhost:8000/docs
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **ROSTR Framework:** https://rostr-paper.vercel.app
- **Ollama Docs:** https://ollama.ai/docs

---

## Support

- **Issues:** https://github.com/yourusername/6th-agent/issues
- **Discussions:** https://github.com/yourusername/6th-agent/discussions

---

**Welcome to 6th Agent!** 🚀

*Built on the ROSTR Framework • Powered by DeepSeek • 100% Local*
