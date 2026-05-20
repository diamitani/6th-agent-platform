# 6th Agent — System Architecture
**ROSTR-Powered Agent Platform with DeepSeek Integration**

Version: 1.0.0  
Date: 2026-04-14  
Status: Production Architecture

---

## Executive Summary

**6th Agent** is a standalone application that implements the complete ROSTR Agent Framework, providing a Claude Console-style interface for building, deploying, and operating production AI agents. Unlike cloud-based solutions, 6th Agent runs locally using DeepSeek via Ollama for fast, private, and cost-effective agent operations.

### Core Capabilities

- **Agent Builder** — Natural language to production agent in minutes
- **File Upload & Knowledge Ingestion** — PDF, Markdown, code, documents → vector knowledge base
- **Integration Connectors** — HubSpot, Slack, GitHub, APIs, MCP servers
- **Agent Deployment** — Multi-platform export (standalone, Claude skill, OpenClaw)
- **Claude-Style Dashboard** — Real-time monitoring, chat interface, workspace management
- **100% Local** — All LLM inference runs via Ollama (DeepSeek-V3)

---

## Technology Stack

### Frontend (Dashboard)
```yaml
framework: Next.js 15 (App Router)
language: TypeScript 5.4+
ui_library: Tailwind CSS + shadcn/ui
state_management: Zustand
real_time: WebSocket (Socket.io)
charts: Recharts
code_editor: Monaco Editor
file_upload: react-dropzone
deployment: Vercel or Docker
```

### Backend (API Server)
```yaml
framework: FastAPI 0.110+
language: Python 3.11+
async_runtime: uvicorn + asyncio
websocket: FastAPI WebSocket
task_queue: Celery + Redis
vector_db: Supabase (pgvector)
file_storage: Local + S3 compatible
deployment: Docker + Railway/Fly.io
```

### LLM Runtime
```yaml
local_inference: Ollama
primary_model: deepseek-r1:7b (fast inference)
reasoning_model: deepseek-r1:32b (complex tasks)
embedding_model: nomic-embed-text
context_window: 32K tokens
streaming: Yes (SSE/WebSocket)
prompt_caching: Redis
```

### Database & Storage
```yaml
primary_db: Supabase (PostgreSQL 15)
vector_storage: pgvector extension
cache: Redis 7+
file_storage: MinIO (S3-compatible) or local filesystem
session_store: Redis
knowledge_base: pgvector + JSONB
```

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         6TH AGENT PLATFORM                               │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                   FRONTEND (Next.js 15)                         │     │
│  │                                                                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │     │
│  │  │   Chat UI    │  │ Agent Builder│  │  Workspace Manager   │  │     │
│  │  │  (Console)   │  │   (Wizard)   │  │  (Projects/Orgs)     │  │     │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │     │
│  │                                                                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │     │
│  │  │ File Upload  │  │ Integrations │  │   Task Monitor       │  │     │
│  │  │  (Dropzone)  │  │  (Connectors)│  │   (NPAO Board)       │  │     │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │ WebSocket + REST API                     │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    BACKEND (FastAPI)                            │     │
│  │                                                                 │     │
│  │  ┌──────────────────────────────────────────────────────────┐  │     │
│  │  │                 ROSTR HUB (Core Platform)                 │  │     │
│  │  │                                                           │  │     │
│  │  │  • Reference Hub (Persistent Context)                    │  │     │
│  │  │  • Agent Registry (Agent Directory)                      │  │     │
│  │  │  • State Manager (Session + Project State)               │  │     │
│  │  │  • Message Bus (Agent Communication)                     │  │     │
│  │  │  • Namespace Manager (Project/Org/Team)                  │  │     │
│  │  └──────────────────────────────────────────────────────────┘  │     │
│  │                                                                 │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐   │     │
│  │  │     PAL     │  │   RAG DAL   │  │        NPAO          │   │     │
│  │  │             │  │             │  │                      │   │     │
│  │  │ • Extract   │  │ • Search    │  │ • Navigate (5D)      │   │     │
│  │  │ • Enhance   │  │ • Validate  │  │ • Prioritize         │   │     │
│  │  │ • Compile   │  │ • Store     │  │ • Allocate           │   │     │
│  │  │ • Route     │  │ • Serve     │  │ • Orchestrate        │   │     │
│  │  └─────────────┘  └─────────────┘  └──────────────────────┘   │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    LLM RUNTIME (Ollama)                         │     │
│  │                                                                 │     │
│  │  ┌──────────────────────────────────────────────────────────┐  │     │
│  │  │  DeepSeek-R1-7B (Fast) | DeepSeek-R1-32B (Reasoning)     │  │     │
│  │  │  • Streaming responses                                   │  │     │
│  │  │  • Prompt caching (Redis)                                │  │     │
│  │  │  • Context management (32K window)                       │  │     │
│  │  └──────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │              DATA LAYER (Supabase + Redis)                      │     │
│  │                                                                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │     │
│  │  │  PostgreSQL  │  │    Redis     │  │      MinIO/S3        │  │     │
│  │  │  (pgvector)  │  │   (Cache)    │  │   (File Storage)     │  │     │
│  │  │              │  │              │  │                      │  │     │
│  │  │ • Agents     │  │ • Sessions   │  │ • Uploaded files     │  │     │
│  │  │ • Projects   │  │ • Prompts    │  │ • Generated code     │  │     │
│  │  │ • KB Vectors │  │ • Tasks      │  │ • Knowledge docs     │  │     │
│  │  │ • State      │  │ • Locks      │  │ • Agent exports      │  │     │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. PAL (Prompt Abstraction Layer)

**Location:** `backend/rostr/pal/`

**Purpose:** Compiles natural language input into precise agent instructions

**Components:**
```python
pal/
├── compiler.py          # Main compilation engine
├── intent_extractor.py  # Intent extraction from raw input
├── context_injector.py  # Reference Hub context injection
├── enhancer.py          # Semantic enhancement
├── runtime_builder.py   # Runtime config generation
└── router.py            # Output routing logic
```

**Key Functions:**
- `compile(raw_input: str, context: dict) -> CompiledInstruction`
- `extract_intent(input: str) -> IntentObject`
- `enhance_prompt(intent: IntentObject) -> EnhancedPrompt`
- `route_to_agent(compiled: CompiledInstruction) -> AgentID`

**Integration with DeepSeek:**
```python
# PAL uses DeepSeek for intent extraction
enhancer = OllamaClient(model="deepseek-r1:7b")
response = enhancer.generate(
    prompt=f"Analyze this request and extract intent: {raw_input}",
    system="You are PAL, the intent extraction engine..."
)
```

---

### 2. RAG DAL (Dynamic Acquisition Layer)

**Location:** `backend/rostr/ragdal/`

**Purpose:** Autonomous knowledge retrieval with multi-pass validation

**Components:**
```python
ragdal/
├── pipeline.py          # Main RAG pipeline orchestrator
├── search_engine.py     # Multi-tier search execution
├── extractors/          # Content extraction (PDF, web, etc.)
├── embeddings.py        # Nomic-embed-text integration
├── knowledge_base.py    # Vector storage (pgvector)
└── validators.py        # Source credibility scoring
```

**3-Tier Search:**
```yaml
tier_1:  # Authoritative (weight: 1.0)
  - arXiv, PubMed, Wikipedia, .gov sites
tier_2:  # Verified editorial (weight: 0.75)
  - Reuters, WSJ, NYT, industry journals
tier_3:  # Community (weight: 0.4)
  - Reddit, HN, Stack Overflow, blogs
```

**Autonomous Loop:**
1. Pass 1: Broad sweep (5 searches)
2. Pass 2: Gap fill (targeted)
3. Pass 3: Deep verification
4. Pass 4: Mark remaining as uncertain

---

### 3. NPAO (Navigate, Prioritize, Allocate, Orchestrate)

**Location:** `backend/rostr/npao/`

**Purpose:** Task routing and prioritization engine

**Components:**
```python
npao/
├── orchestrator.py      # Main NPAO engine
├── navigator.py         # 5D phase classification
├── priority_scorer.py   # Priority calculation
├── allocator.py         # Agent matching algorithm
└── phases/              # 5D phase definitions
    ├── pred.py
    ├── design.py
    ├── development.py
    ├── deployment.py
    └── debugging.py
```

**5D Framework:**
```
PreD → Design → Development → Deployment
         ↓                        ↓
      [Debugging can restart any phase]
```

**Priority Score:**
```python
score = (
    phase_urgency * 0.35 +
    dependency_impact * 0.30 +
    business_impact * 0.25 +
    resource_efficiency * 0.10
)
```

---

### 4. Rostr Hub (Platform Core)

**Location:** `backend/rostr/hub/`

**Purpose:** Central orchestration, state, and agent management

**Components:**
```python
hub/
├── registry.py          # Agent registry
├── state_manager.py     # Session + project state
├── message_bus.py       # Agent communication
├── reference_hub.py     # Persistent context store
└── namespace_manager.py # Project/org/team isolation
```

**Reference Hub Structure:**
```
reference_hub/
├── projects/{project_id}/
│   ├── goals.md
│   ├── decisions.md
│   ├── knowledge-base/
│   ├── learnings.jsonl
│   └── timeline.jsonl
├── orgs/{org_id}/
│   ├── identity.md
│   ├── icp.md
│   └── playbooks/
└── global/
    └── knowledge-base/
```

---

## File Upload & Knowledge Ingestion

**Flow:**
```
User uploads file → FastAPI endpoint → Parse + Chunk → Generate embeddings → Store in pgvector
```

**Supported Formats:**
- **Documents:** PDF, DOCX, TXT, MD, RTF
- **Code:** .py, .js, .ts, .java, .go, .rs, etc.
- **Data:** CSV, JSON, YAML
- **Archives:** ZIP (auto-extract)

**Processing Pipeline:**
```python
# 1. Upload
file = await upload_file(file_data)

# 2. Extract text
text = extract_content(file.path, file.mime_type)

# 3. Chunk
chunks = chunker.split(text, chunk_size=512, overlap=64)

# 4. Embed
embeddings = nomic_embed(chunks)

# 5. Store
await kb.store(chunks, embeddings, metadata={
    "source": file.name,
    "project_id": project.id,
    "uploaded_at": datetime.utcnow()
})
```

---

## Integration Connector Framework

**Location:** `backend/rostr/integrations/`

**Architecture:**
```python
integrations/
├── base.py              # BaseConnector class
├── oauth_manager.py     # OAuth 2.0 flow handler
├── mcp_client.py        # MCP protocol client
└── connectors/
    ├── hubspot.py
    ├── slack.py
    ├── github.py
    ├── gmail.py
    └── custom_api.py
```

**Connector Interface:**
```python
class BaseConnector:
    async def authenticate(self, credentials: dict) -> bool
    async def test_connection(self) -> bool
    async def execute_action(self, action: str, params: dict) -> dict
    async def get_schema(self) -> dict
```

**MCP Support:**
- Auto-discover MCP servers
- Parse tool schemas
- Execute MCP tools as agent actions
- Cache tool results

---

## Agent Deployment System

**Multi-Platform Export:**

### 1. Standalone Agent
```
exports/standalone/
├── agent.yaml           # ROSTR agent manifest
├── system-instructions.md
├── rostr-hub/
├── tools/
└── README.md
```

### 2. Claude Skill
```
exports/claude-skill/
├── SKILL.md             # Skill with YAML frontmatter
└── references/          # Supporting files
```

### 3. OpenClaw Config
```
exports/openclaw/
├── SOUL.md
├── IDENTITY.md
├── RULES.md
├── MEMORY.md
└── HEARTBEAT.md
```

### 4. API Endpoint
```
POST /agents/{agent_id}/deploy
→ Generates Docker container with agent runtime
→ Returns deployment URL + API key
```

---

## Dashboard UI Components

**Chat Interface (Claude Console Style):**
```typescript
// components/Chat/ChatInterface.tsx
- Message list with streaming
- Code blocks with syntax highlighting
- File attachments display
- Artifact preview
- Regenerate/edit capabilities
```

**Agent Builder Wizard:**
```typescript
// components/AgentBuilder/Wizard.tsx
Step 1: Describe agent (natural language)
Step 2: Review PAL-compiled spec
Step 3: Configure tools & integrations
Step 4: Upload knowledge files
Step 5: Deploy (choose platform)
```

**Workspace Manager:**
```typescript
// components/Workspace/WorkspaceManager.tsx
- Project list
- Org settings
- Team namespaces
- Agent registry
- Knowledge base browser
```

**NPAO Task Board:**
```typescript
// components/TaskBoard/NPAOBoard.tsx
- 5D phase columns
- Priority-sorted tasks
- Agent allocation view
- Real-time updates via WebSocket
```

---

## API Endpoints

### Core API Routes

```yaml
# Agents
POST   /api/agents/create           # Create new agent
GET    /api/agents                  # List all agents
GET    /api/agents/{id}             # Get agent details
PUT    /api/agents/{id}             # Update agent
DELETE /api/agents/{id}             # Delete agent
POST   /api/agents/{id}/deploy      # Deploy agent

# Chat
POST   /api/chat/message            # Send message
WS     /api/chat/stream             # WebSocket streaming
GET    /api/chat/history            # Get conversation history

# Files & Knowledge
POST   /api/files/upload            # Upload file
GET    /api/knowledge/search        # Vector search
POST   /api/knowledge/ingest        # Ingest documents

# Integrations
GET    /api/integrations            # List available
POST   /api/integrations/connect    # OAuth flow start
GET    /api/integrations/callback   # OAuth callback
POST   /api/integrations/test       # Test connection

# Workspaces
POST   /api/workspaces              # Create workspace
GET    /api/workspaces              # List workspaces
GET    /api/workspaces/{id}         # Get workspace

# Tasks (NPAO)
GET    /api/tasks                   # Get task queue
POST   /api/tasks                   # Create task
PUT    /api/tasks/{id}              # Update task
WS     /api/tasks/stream            # Real-time updates
```

---

## DeepSeek/Ollama Integration

**Why DeepSeek via Ollama:**
- ✅ 100% local inference (privacy)
- ✅ Zero API costs
- ✅ Fast inference (optimized for M-series Macs)
- ✅ Large context window (32K)
- ✅ Strong reasoning (DeepSeek-R1)
- ✅ Open weights (MIT license)

**Model Selection:**
```yaml
fast_tasks:
  model: deepseek-r1:7b
  use_cases: [PAL compilation, intent extraction, simple queries]
  latency: ~200ms

reasoning_tasks:
  model: deepseek-r1:32b
  use_cases: [NPAO planning, complex research, architecture design]
  latency: ~1-2s

embeddings:
  model: nomic-embed-text
  use_cases: [vector search, knowledge base]
  dimensions: 768
```

**Ollama Client:**
```python
from ollama import AsyncClient

class OllamaManager:
    def __init__(self):
        self.client = AsyncClient(host='http://localhost:11434')
        
    async def generate(
        self,
        model: str,
        prompt: str,
        system: str = None,
        stream: bool = True
    ):
        response = await self.client.generate(
            model=model,
            prompt=prompt,
            system=system,
            stream=stream
        )
        
        if stream:
            async for chunk in response:
                yield chunk['response']
        else:
            return response['response']
```

**Prompt Caching:**
```python
# Cache frequently used prompts in Redis
cache_key = f"prompt:{hash(system_prompt + user_input)}"
cached = await redis.get(cache_key)

if cached:
    return cached
else:
    response = await ollama.generate(...)
    await redis.setex(cache_key, 3600, response)
    return response
```

---

## Deployment Architecture

### Development
```yaml
frontend: npm run dev (localhost:3000)
backend: uvicorn main:app --reload (localhost:8000)
ollama: ollama serve (localhost:11434)
supabase: supabase start (localhost:54321)
redis: redis-server (localhost:6379)
```

### Production (Docker Compose)
```yaml
services:
  frontend:
    image: 6th-agent-frontend:latest
    ports: ["3000:3000"]
    
  backend:
    image: 6th-agent-backend:latest
    ports: ["8000:8000"]
    depends_on: [redis, postgres]
    
  ollama:
    image: ollama/ollama:latest
    volumes: [./models:/root/.ollama]
    
  postgres:
    image: supabase/postgres:15
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      
  redis:
    image: redis:7-alpine
```

---

## Security Considerations

- **Authentication:** JWT tokens + refresh tokens
- **API Keys:** Encrypted storage (Fernet)
- **File Upload:** Virus scanning, size limits (100MB), type validation
- **Sandboxing:** Code execution in Docker containers
- **Rate Limiting:** Redis-based (100 req/min per user)
- **CORS:** Configured per environment
- **Secrets:** Environment variables, never committed

---

## Performance Targets

```yaml
api_response: < 200ms (p95)
streaming_latency: < 50ms (first token)
file_upload: < 5s for 10MB file
vector_search: < 100ms for 1M vectors
agent_build: < 30s (full pipeline)
concurrent_users: 100+ (per instance)
```

---

## Next Steps

1. ✅ Architecture defined
2. → Initialize project structure
3. → Implement PAL module
4. → Implement RAG DAL module
5. → Implement NPAO module
6. → Build Rostr Hub core
7. → Integrate Ollama/DeepSeek
8. → Build dashboard UI
9. → Create agent deployment pipeline
10. → Write documentation

---

*6th Agent — Built on the ROSTR Framework*  
*Open Source • Local-First • Production-Ready*
