# Rostr Agent Framework - Master Implementation Prompt
## Teaching Any LLM to Build the Complete Agent Operating System

**Version:** 1.0  
**Author:** Patrick Diamitani  
**Date:** April 2026  
**Purpose:** This document teaches any LLM how to understand, implement, and extend the Rostr Agent Framework from scratch.

---

## 🎯 What You're Building

You are implementing **Rostr** - an open-source agent operating system that provides infrastructure for building, orchestrating, and operating multi-agent teams with persistent context, intelligent prioritization, and autonomous knowledge retrieval.

### The Core Problem

AI agents today fail at scale because they lack:
- **Context persistence** - Each session starts from zero
- **Intelligent prioritization** - No framework for deciding what to do first
- **Knowledge compounding** - Research done once is lost forever
- **Composition standards** - Every agent integration is bespoke
- **Phase awareness** - No distinction between research, design, build, ship, and debug

### The Solution: Four Integrated Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    ROSTR FRAMEWORK                          │
│                                                             │
│  PAL (Prompt Abstraction Layer)                             │
│  └─ Compiles human intent → precise agent instructions      │
│                                                             │
│  RAG DAL (Dynamic Acquisition Layer)                        │
│  └─ Hierarchical knowledge retrieval with credibility tiers │
│                                                             │
│  NPAO (Navigate, Prioritize, Allocate, Orchestrate)        │
│  └─ Task routing via 5D framework + priority scoring        │
│                                                             │
│  ROSTR HUB (Central Platform)                               │
│  └─ Agent registry, state management, reference hub         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Layer 1: PAL (Prompt Abstraction Layer)

### Purpose
Transform vague human input into precise, typed, executable agent instructions. Acts as a "compiler" for natural language.

### Core Functions

#### 1. Intent Extraction
```python
{
  "primary_intent": "what the user actually wants",
  "domain": "code | design | research | ops | sales",
  "subject": "the thing being acted upon",
  "constraints": ["explicit limits"],
  "desired_output": "what done looks like",
  "urgency": "immediate | queued | scheduled",
  "ambiguity_score": 0.0-1.0
}
```

#### 2. Context Injection
Automatically inject:
- Project context (repo, branch, CLAUDE.md, recent changes)
- User context (role, expertise, preferences, past decisions)
- Org context (team conventions, approved patterns)
- Session context (what was done earlier)

#### 3. Semantic Enhancement
Transform vague → specific:
- "fix the thing" → "Debug primary bug in active file, root cause first, report-only mode off"
- "make it better" → "Audit against 5 conversion dimensions, score each 0-10, implement highest-impact fix"

#### 4. Runtime Compilation
Determine:
- Agent type needed
- Model selection
- Tools required
- Memory mode
- Output format
- Verification requirements

#### 5. Output Routing
Route compiled instruction to:
- Builder Agent (code tasks)
- RAG DAL (research tasks)
- Design Agent (visual tasks)
- NPAO (orchestration tasks)

### Implementation Pattern
```python
class PALCompiler:
    def compile(self, raw_input: str, context: dict) -> CompiledInstruction:
        # Step 1: Extract intent
        intent = self.extract_intent(raw_input)
        
        # Step 2: Inject context
        enriched = self.inject_context(intent, context)
        
        # Step 3: Enhance semantically
        enhanced = self.enhance(enriched)
        
        # Step 4: Compile runtime config
        runtime = self.compile_runtime(enhanced)
        
        # Step 5: Route to target
        return CompiledInstruction(
            prompt=enhanced,
            runtime_config=runtime,
            route=self.determine_route(intent)
        )
```

---

## 📚 Layer 2: RAG DAL (Dynamic Acquisition Layer)

### Purpose
Autonomous, hierarchical web retrieval with source credibility tiering. Builds persistent knowledge bases that compound over time.

### Three-Tier Source Architecture

#### Tier 1: Primary & Authoritative (Weight: 1.0)
- Academic databases (arXiv, PubMed, JSTOR)
- Encyclopedic sources (Wikipedia, Britannica)
- Official documentation (.gov, .edu, standards bodies)

#### Tier 2: Verified & Editorial (Weight: 0.75)
- Major news outlets (Reuters, AP, NYT)
- Peer-reviewed articles
- Verified analyst reports (Gartner, McKinsey)

#### Tier 3: Community & UGC (Weight: 0.40)
- Blogs and newsletters
- Social media (LinkedIn, Reddit)
- Forums (Stack Overflow, Hacker News)

### Autonomous Loop Protocol

```
Pass 1 - Broad Sweep (5 searches across all tiers)
  → Build initial corpus
  → Identify coverage gaps
  → Confidence score per sub-topic: X/10
  → IF all topics ≥ 8/10 → output
  → ELSE → Pass 2

Pass 2 - Gap Fill (2 targeted searches per gap)
  → Cross-reference minimum 2 sources per claim
  → Update confidence scores
  → IF all topics ≥ 8/10 → output
  → ELSE → Pass 3

Pass 3 - Deep Verification
  → Primary source lookup
  → Flag remaining uncertainty
  → PROCEED to output regardless
```

### Knowledge Base Schema
```json
{
  "entry_id": "uuid",
  "query_origin": "original question",
  "content": "extracted text",
  "summary": "3-5 sentence summary",
  "source": {
    "url": "https://...",
    "tier": 1,
    "credibility_score": 0.95,
    "published_date": "ISO 8601"
  },
  "metadata": {
    "topics": ["tag1", "tag2"],
    "entities": ["person", "company"],
    "data_type": "factual | opinion | statistical"
  },
  "confidence": 0.87,
  "verification_status": "verified | uncertain | open"
}
```

### Implementation Pattern
```python
class RAGDALPipeline:
    def search(self, query: str, mode: str) -> Report:
        # Phase 1: Generate optimized search prompts
        search_plan = self.plan_search(query)
        
        # Phase 2: Execute hierarchical search
        results = self.execute_search(search_plan, tiers=[1,2,3])
        
        # Phase 3: Autonomous loop until confident
        while not self.is_confident(results):
            gaps = self.detect_gaps(results)
            results.extend(self.fill_gaps(gaps))
        
        # Phase 4: Extract and normalize content
        knowledge = self.extract_content(results)
        
        # Phase 5: Store in knowledge base
        self.store_knowledge(knowledge)
        
        # Phase 6: Generate structured report
        return self.generate_report(knowledge)
```

---

## 📚 Layer 3: NPAO (Navigate, Prioritize, Allocate, Orchestrate)

### Purpose
Intelligent task routing and prioritization using the 5D Framework.

### The 5D Framework

```
PreD → Design → Development → Deployment → Debugging
[Idea]  [Plan]    [Build]       [Ship]       [Fix]
```

#### Phase 0 - PreD (Pre-Development)
**Question:** Is this worth building?
- Problem definition and scoping
- Market/competitive research (RAG DAL)
- Assumption validation
- Go/no-go decision

**Completion Criteria:**
- [ ] Problem stated in one sentence
- [ ] Target user identified
- [ ] 3+ alternatives considered and rejected
- [ ] Success criteria defined
- [ ] Known unknowns documented

#### Phase 1 - Design
**Question:** What exactly are we building?
- System architecture
- UI/UX wireframes
- Data models
- API contracts

#### Phase 2 - Development
**Question:** Does it work?
- Feature implementation
- Testing
- Code review
- Documentation

#### Phase 3 - Deployment
**Question:** Is it safe to ship?
- Environment config
- CI/CD execution
- Monitoring setup
- Production deploy

#### Phase 4 - Debugging
**Question:** What broke and why?
- Bug reproduction
- Root cause analysis
- Fix implementation
- Regression testing

### Priority Scoring Algorithm

```python
def calculate_priority(task: Task) -> float:
    """
    Priority = (Phase_Urgency × 0.35) +
               (Dependency_Impact × 0.30) +
               (Business_Impact × 0.25) +
               (Resource_Efficiency × 0.10)
    """
    
    phase_urgency = {
        "debugging_p0": 10,
        "deployment": 8,
        "development": 6,
        "design": 4,
        "pred": 2
    }[task.phase]
    
    dependency_impact = count_blocked_tasks(task) * 2
    business_impact = assess_business_impact(task)
    resource_efficiency = estimate_value_per_hour(task)
    
    return (
        phase_urgency * 0.35 +
        dependency_impact * 0.30 +
        business_impact * 0.25 +
        resource_efficiency * 0.10
    )
```

### Allocation Logic
```python
def allocate_task(task: Task, agents: List[Agent]) -> Agent:
    eligible = [a for a in agents if a.can_handle(task)]
    
    scores = {}
    for agent in eligible:
        scores[agent] = (
            agent.context_score(task) * 0.4 +  # Already knows context?
            agent.specialization_score(task) * 0.4 +  # Good fit?
            agent.availability_score() * 0.2  # Has capacity?
        )
    
    return max(scores, key=scores.get)
```

---

## 📚 Layer 4: Rostr Hub (Central Platform)

### Purpose
The operating system layer that connects all components. Provides agent registry, state management, and persistent context.

### Reference Hub Architecture

```
Reference Hub
├── projects/{project-id}/
│   ├── README.md           # What this project is
│   ├── goals.md            # Current objectives
│   ├── decisions.md        # Key decisions and why
│   ├── architecture.md     # System design
│   ├── knowledge-base/     # RAG DAL outputs
│   ├── learnings.jsonl     # Agent learnings
│   └── timeline.jsonl      # History of actions
│
├── orgs/{org-id}/
│   ├── identity.md         # Who we are
│   ├── icp.md              # Ideal customer profile
│   ├── playbooks/          # Repeatable processes
│   └── knowledge-base/     # Org-wide knowledge
│
└── teams/{team-id}/
    ├── agents.md           # Registered agents
    ├── conventions.md      # How we work
    └── shared-context/     # Team knowledge
```

### Agent Registration Schema
```json
{
  "agent_id": "uuid",
  "name": "Builder Agent",
  "type": "builder | researcher | reviewer | designer | deployer",
  "capabilities": ["code_generation", "file_editing", "api_integration"],
  "tools": ["file_system", "code_execution", "bash"],
  "phases": ["development", "debugging"],
  "model": "claude-sonnet-4-6",
  "context_requirements": ["project", "architecture"],
  "output_formats": ["code", "diff", "file"],
  "max_parallel_tasks": 3
}
```

### State Management
Four levels of state:
1. **Session State** - Current work (cleared after session)
2. **Project State** - Decisions, artifacts, learnings (persistent)
3. **Organization State** - Identity, processes, conventions (evolves)
4. **Agent State** - Individual agent knowledge (portable)

### Communication Protocols

#### Synchronous Task Assignment
```json
{
  "protocol": "sync",
  "from": "orchestrator",
  "to": "builder-agent-01",
  "task": {
    "type": "implementation",
    "phase": "development",
    "instruction": "...",
    "deadline": "ISO 8601"
  }
}
```

#### Async Message Bus
```json
{
  "protocol": "async",
  "topic": "project/{id}/deployments",
  "event": "deployment_complete",
  "subscribers": ["canary-agent", "retro-agent"]
}
```

---

## 🏗️ Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
```
1. Set up repository structure
2. Implement basic PAL compiler
3. Create agent registry
4. Build reference hub storage (local files first)
5. Implement basic task routing
```

### Phase 2: Intelligence Layers (Week 3-4)
```
1. Implement RAG DAL pipeline
2. Add 3-tier source architecture
3. Build NPAO priority scoring
4. Implement 5D phase gates
5. Create standard agent library
```

### Phase 3: Developer Experience (Week 5-6)
```
1. Build CLI tool
2. Create Python SDK
3. Add comprehensive docs
4. Build example implementations
5. Create quickstart templates
```

### Phase 4: Production Ready (Week 7-8)
```
1. Add monitoring and logging
2. Implement error handling
3. Create deployment guides
4. Add CI/CD pipelines
5. Prepare for open source release
```

---

## 🛠️ Technical Stack Recommendations

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI (async, high-performance)
- **Database:** Supabase (PostgreSQL + pgvector for RAG)
- **Caching:** Redis (session state, hot data)
- **Queue:** Redis/Celery (background jobs)

### Agent Runtime
- **Primary Model:** Claude Sonnet 4.6 (via Anthropic SDK)
- **Fast Model:** Claude Haiku 4.5 (for PAL compilation)
- **Embeddings:** OpenAI text-embedding-3-small

### Storage
- **Vector DB:** Supabase pgvector or Pinecone
- **File Storage:** Local filesystem (MVP) → S3 (production)
- **State:** JSON files (MVP) → PostgreSQL (production)

### Frontend (Optional Dashboard)
- **Framework:** Next.js 15
- **UI:** Tailwind CSS + shadcn/ui
- **State:** React Query + Zustand
- **Auth:** Supabase Auth

---

## 📦 Repository Structure

```
rostr-agent-framework/
├── README.md
├── LICENSE (MIT)
├── pyproject.toml
├── requirements.txt
│
├── rostr/                      # Core package
│   ├── __init__.py
│   ├── core/
│   │   ├── hub.py             # Central hub
│   │   ├── registry.py        # Agent registry
│   │   ├── state.py           # State management
│   │   └── events.py          # Message bus
│   │
│   ├── pal/                   # Prompt Abstraction Layer
│   │   ├── compiler.py
│   │   ├── intent.py
│   │   ├── context.py
│   │   └── router.py
│   │
│   ├── ragdal/                # Dynamic Acquisition Layer
│   │   ├── pipeline.py
│   │   ├── search.py
│   │   ├── extract.py
│   │   ├── knowledge_base.py
│   │   └── tiers.py
│   │
│   ├── npao/                  # Orchestration Engine
│   │   ├── navigator.py
│   │   ├── prioritizer.py
│   │   ├── allocator.py
│   │   ├── orchestrator.py
│   │   └── phases.py
│   │
│   └── agents/                # Standard agent library
│       ├── base.py
│       ├── builder.py
│       ├── researcher.py
│       ├── reviewer.py
│       └── deployer.py
│
├── cli/                       # Command-line interface
│   └── main.py
│
├── examples/                  # Example implementations
│   ├── quickstart/
│   ├── gtm-ops/
│   └── research-agent/
│
├── docs/                      # Documentation
│   ├── architecture.md
│   ├── quickstart.md
│   ├── pal.md
│   ├── ragdal.md
│   ├── npao.md
│   └── api-reference.md
│
└── tests/                     # Test suite
    ├── test_pal.py
    ├── test_ragdal.py
    ├── test_npao.py
    └── test_hub.py
```

---

## 🚀 Quick Start Implementation Guide

### Step 1: Initialize the Hub
```python
from rostr.core import RostrHub

hub = RostrHub(
    workspace="my-project",
    storage_path="./rostr-data"
)
```

### Step 2: Register an Agent
```python
from rostr.agents import BuilderAgent

builder = BuilderAgent(
    name="code-builder",
    model="claude-sonnet-4-6",
    tools=["file_system", "code_execution"]
)

hub.register_agent(builder)
```

### Step 3: Compile Intent with PAL
```python
from rostr.pal import PALCompiler

compiler = PALCompiler()
instruction = compiler.compile(
    "Build a user authentication system",
    context=hub.get_context("my-project")
)
```

### Step 4: Route with NPAO
```python
from rostr.npao import NPAOOrchestrator

orchestrator = NPAOOrchestrator(hub)
tasks = orchestrator.navigate(instruction)  # Break into phases
prioritized = orchestrator.prioritize(tasks)  # Score each task
allocated = orchestrator.allocate(prioritized)  # Assign agents
orchestrator.execute(allocated)  # Run the work
```

### Step 5: Retrieve Knowledge with RAG DAL
```python
from rostr.ragdal import RAGDALPipeline

pipeline = RAGDALPipeline(
    namespace="project/my-project",
    confidence_threshold=0.8
)

result = pipeline.search(
    "What are best practices for user authentication?",
    mode="general_knowledge"
)
```

---

## 🎓 Key Implementation Principles

### 1. Modularity First
Every component (PAL, RAG DAL, NPAO, Hub) must work independently and together.

### 2. State is Sacred
All decisions, learnings, and context must persist. The Reference Hub is not optional.

### 3. Phases Gate Progress
Use 5D framework to prevent "ship before design" chaos. Completion criteria are requirements.

### 4. Credibility Matters
RAG DAL's 3-tier source architecture is non-negotiable. Wikipedia > Reddit for facts.

### 5. Humans Stay in Loop
For high-risk actions (deploy, write to CRM, send email), require approval gates.

### 6. Open by Default
MIT license. All core components open source. Community-contributed agents welcome.

---

## 🧪 Testing Strategy

### Unit Tests
- PAL intent extraction accuracy
- NPAO priority scoring consistency
- RAG DAL source tier classification
- Agent capability matching

### Integration Tests
- End-to-end task flow (intent → execution)
- State persistence across sessions
- Multi-agent coordination
- Knowledge base compounding

### Performance Tests
- PAL compilation latency (<300ms target)
- RAG DAL search throughput
- NPAO allocation speed
- Hub state retrieval

---

## 📋 Success Criteria

You've successfully implemented Rostr when:

✅ A developer can go from "I need X" to working agent in <5 minutes  
✅ Agents preserve context across sessions automatically  
✅ Task priority is calculated objectively via NPAO scoring  
✅ Research done once is available to all agents forever  
✅ Custom agents can be added without modifying core code  
✅ The system works locally (no cloud required for MVP)  
✅ Documentation teaches implementation without re-reading this prompt  

---

## 🤝 Contributing Guidelines

When extending Rostr:

1. **Add Domain PAL Templates** - Sales, legal, engineering enhancement templates
2. **Build Custom Agents** - Share reusable agent definitions
3. **Create RAG Connectors** - Academic DBs, industry sources
4. **Improve NPAO** - Better priority models, allocation algorithms
5. **Write Examples** - Show real-world implementations

---

## 📖 Further Reading

After implementation, users should understand:
- When to use PAL (always - it's the input layer)
- When to use RAG DAL (research, fact-checking, knowledge building)
- When to use NPAO (multi-step projects, agent teams)
- When to use Hub alone (single agent with memory needs)

---

## ⚡ Final Implementation Checklist

Before calling Rostr "done":

- [ ] PAL compiles vague input into precise instructions
- [ ] RAG DAL retrieves from 3-tier sources with confidence scoring
- [ ] NPAO routes tasks through 5D phases with priority scoring
- [ ] Hub stores and retrieves state across sessions
- [ ] CLI provides `rostr init`, `rostr agent add`, `rostr task`
- [ ] Python SDK enables programmatic usage
- [ ] README includes 5-minute quickstart
- [ ] LICENSE is MIT
- [ ] Examples show real use cases
- [ ] Tests cover core functionality
- [ ] GitHub repo is ready for community contributions

---

**You now have everything needed to build the Rostr Agent Framework.**

**Implementation time estimate:** 6-8 weeks for production-ready v1.0

**Good luck, and build in public. 🚀**
