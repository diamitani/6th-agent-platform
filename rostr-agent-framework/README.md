# Rostr Agent Framework

**Open Source Agent Team Operating System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)

> Build production AI agent teams with persistent context, intelligent prioritization, and autonomous knowledge retrieval.

---

## What is Rostr?

Rostr is a unified framework for building autonomous agent teams that actually work at scale. It solves the four critical problems that make multi-agent systems fail:

1. **Context Collapse** → **Reference Hub** preserves state across sessions
2. **Priority Chaos** → **NPAO** scores and routes tasks intelligently  
3. **Knowledge Loss** → **RAG DAL** builds persistent, credible knowledge bases
4. **Integration Fragmentation** → **PAL** provides a universal compilation layer

## The Four Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    ROSTR FRAMEWORK                          │
│                                                             │
│  PAL → Prompt Abstraction Layer                             │
│  Compiles human intent into precise agent instructions      │
│                                                             │
│  RAG DAL → Dynamic Acquisition Layer                        │
│  Hierarchical knowledge retrieval with 3-tier credibility   │
│                                                             │
│  NPAO → Navigate, Prioritize, Allocate, Orchestrate        │
│  Task routing via 5D framework + priority scoring           │
│                                                             │
│  ROSTR HUB → Central Platform                               │
│  Agent registry, state management, persistent context       │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Installation

```bash
pip install rostr-framework
```

### 5-Minute Setup

```python
from rostr.core import RostrHub
from rostr.agents import BuilderAgent

# 1. Initialize hub
hub = RostrHub(workspace="my-project")

# 2. Register an agent
builder = BuilderAgent(
    name="code-builder",
    model="claude-sonnet-4-6"
)
hub.register_agent(builder)

# 3. Give it a task (PAL handles the rest)
result = hub.execute(
    "Build a user authentication system with JWT tokens"
)
```

### Using the CLI

```bash
# Initialize a new workspace
rostr init my-project

# Add an agent
rostr agent add --name builder --type builder

# Run a task
rostr task "Research best practices for API rate limiting"

# Check status
rostr status
```

## Core Concepts

### The 5D Framework

All work flows through five phases:

- **PreD** (Pre-Development) → Is this worth building?
- **Design** → What exactly are we building?
- **Development** → Does it work?
- **Deployment** → Is it safe to ship?
- **Debugging** → What broke and why?

NPAO uses these phases to route tasks to the right agents at the right time.

### Three-Tier Knowledge Retrieval

RAG DAL enforces source credibility:

- **Tier 1** (1.0 weight) → Academic, encyclopedic, official docs
- **Tier 2** (0.75 weight) → Major news, peer-reviewed, analyst reports  
- **Tier 3** (0.40 weight) → Blogs, social media, forums

Knowledge is verified across tiers before storage.

### Persistent Context

The Reference Hub preserves:
- Project goals and decisions
- Agent learnings
- Retrieved knowledge
- Task history
- Team conventions

No more starting from zero each session.

## Architecture

```
rostr/
├── core/          # Hub, registry, state management
├── pal/           # Intent compilation and routing
├── ragdal/        # Knowledge retrieval pipeline
├── npao/          # Task prioritization and allocation
└── agents/        # Standard agent library
```

## Standard Agent Library

Rostr ships with pre-built agents:

- **Builder Agent** → Code generation, file editing
- **Research Agent** → RAG DAL-powered investigation
- **Review Agent** → Code review, quality gates
- **QA Agent** → Test execution, bug finding
- **Deploy Agent** → CI/CD, shipping, monitoring
- **Debug Agent** → Root cause analysis

## Use Cases

### Solo Developer
```python
# Personal assistant with memory
hub = RostrHub("my-workspace")
hub.register_agent(BuilderAgent("assistant"))
hub.execute("Continue working on the auth feature from yesterday")
# → Loads context from previous session automatically
```

### Startup Team
```yaml
# Multi-agent GTM ops team
hub:
  namespace: revenue-ops
  
agents:
  - prospect-researcher  # Enriches leads
  - pipeline-monitor     # Tracks deal health
  - outreach-writer      # Drafts emails

workflow:
  - Research accounts daily
  - Flag stalled deals
  - Generate follow-up actions
```

### Enterprise
```yaml
# Department-wide agent infrastructure
org:
  namespaces:
    - sales-ops
    - product-eng
    - customer-success
  
shared_knowledge:
  - ICP definition
  - Brand guidelines
  - Process playbooks
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [PAL Deep Dive](docs/pal.md)
- [RAG DAL Guide](docs/ragdal.md)
- [NPAO Framework](docs/npao.md)
- [API Reference](docs/api-reference.md)

## Examples

- [Quickstart Tutorial](examples/quickstart/)
- [GTM Ops Agent](examples/gtm-ops/)
- [Research Pipeline](examples/research-agent/)

## Roadmap

### v0.1 (Current)
- [x] Core hub infrastructure
- [x] Basic PAL compiler
- [x] Agent registry
- [x] Reference hub (local storage)
- [ ] CLI tool
- [ ] Python SDK

### v0.2 (Next)
- [ ] RAG DAL pipeline
- [ ] NPAO priority scoring
- [ ] Standard agent library
- [ ] Vector storage integration

### v1.0 (Production)
- [ ] Dashboard UI
- [ ] Multi-user support
- [ ] Cloud deployment guides
- [ ] Agent marketplace

## Contributing

We welcome contributions! Areas where you can help:

- **Domain PAL Templates** → Sales, legal, engineering enhancement templates
- **Custom Agents** → Build and share specialized agents
- **RAG Connectors** → Academic databases, industry sources
- **Documentation** → Guides, tutorials, examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Community

- [GitHub Discussions](https://github.com/rostr-ai/rostr/discussions)
- [Discord Server](https://discord.gg/rostr)
- [Twitter](https://twitter.com/rostr_ai)

## Credits

Created by Patrick Diamitani

Inspired by the need for better agent infrastructure and influenced by:
- OpenClaw (agent gateway pattern)
- LangChain (tool chaining)
- CrewAI (role-based agents)
- DOE Model (Directives → Orchestration → Execution)

---

**Build production agent teams that remember, prioritize, and compound.**

**Get started:** `pip install rostr-framework`
