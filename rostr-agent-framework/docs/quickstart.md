# Rostr Quickstart Guide

Get up and running with Rostr in 5 minutes.

## Installation

```bash
pip install rostr-framework
```

Or install from source:

```bash
git clone https://github.com/rostr-ai/rostr.git
cd rostr
pip install -e .
```

## Configure API Keys

Create a `.env` file:

```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## Your First Agent Team

### Method 1: Using Python

```python
from rostr.core import RostrHub
from rostr.agents import BuilderAgent

# 1. Initialize hub
hub = RostrHub(workspace="my-project")

# 2. Register an agent
builder = BuilderAgent(name="code-builder")
hub.register_agent(builder.to_definition())

# 3. Execute a task
result = hub.execute(
    "Build a user authentication system with JWT tokens"
)

print(result['compiled_intent'])
print(result['enhanced_prompt'])
```

### Method 2: Using CLI

```bash
# Initialize workspace
rostr init my-project

# Add an agent
rostr agent add --name builder --type builder

# Run a task
rostr task "Research best practices for API rate limiting"

# Check status
rostr status
```

## Core Concepts in 60 Seconds

### 1. The Hub
The central platform that connects everything.

```python
hub = RostrHub(workspace="my-project")
```

### 2. Agents
Specialized workers with defined capabilities.

```python
from rostr.agents import BuilderAgent, ResearcherAgent

builder = BuilderAgent(name="code-builder")
researcher = ResearcherAgent(name="research-assistant")
```

### 3. PAL (Prompt Abstraction Layer)
Compiles vague input into precise instructions.

```python
from rostr.pal import PALCompiler

compiler = PALCompiler()
instruction = compiler.compile("fix the login bug")
print(instruction.enhanced_prompt)
```

### 4. RAG DAL (Dynamic Acquisition Layer)
Retrieves knowledge with credibility tiering.

```python
import asyncio
from rostr.ragdal import RAGDALPipeline

pipeline = RAGDALPipeline()

async def research():
    report = await pipeline.search(
        "What are best practices for password hashing?",
        namespace="my-project"
    )
    print(report.to_markdown())

asyncio.run(research())
```

### 5. NPAO (Navigate, Prioritize, Allocate, Orchestrate)
Routes tasks through the 5D framework.

```python
from rostr.npao import NPAOOrchestrator

orchestrator = NPAOOrchestrator()
phase = orchestrator.navigate("fix the authentication bug")
print(phase)  # Phase.DEBUGGING
```

## The 5D Framework

All work flows through five phases:

1. **PreD** → Is this worth building? (Research & planning)
2. **Design** → What are we building? (Architecture & specs)
3. **Development** → Does it work? (Implementation & testing)
4. **Deployment** → Is it safe to ship? (Release & monitoring)
5. **Debugging** → What broke and why? (Fix & post-mortem)

NPAO uses these phases to route tasks correctly.

## Example Workflows

### Solo Developer

```python
hub = RostrHub("my-app")
hub.register_agent(BuilderAgent("assistant").to_definition())

# Tasks automatically preserve context across sessions
hub.execute("Continue working on the auth feature from yesterday")
```

### Research Pipeline

```python
hub = RostrHub("research-project")
hub.register_agent(ResearcherAgent("researcher").to_definition())

# RAG DAL automatically retrieves and stores knowledge
result = hub.execute("Research competitor pricing for SaaS tools")

# Knowledge is cached and reusable
result2 = hub.execute("What did we learn about SaaS pricing?")
```

### Multi-Agent Team

```python
from rostr.npao import NPAOOrchestrator, Task, Agent, Phase
import uuid

orchestrator = NPAOOrchestrator()

# Register agents
orchestrator.register_agent(Agent(
    id="builder-1",
    name="Builder",
    type="builder",
    phases=[Phase.DEVELOPMENT],
    current_tasks=[]
))

orchestrator.register_agent(Agent(
    id="researcher-1",
    name="Researcher",
    type="researcher",
    phases=[Phase.PRED],
    current_tasks=[]
))

# Create and orchestrate tasks
tasks = [
    Task(
        id=str(uuid.uuid4()),
        description="Research authentication libraries",
        phase=Phase.PRED,
        blocks=[],
        blocked_by=[],
        business_impact=7.0,
        estimated_hours=2.0
    ),
    Task(
        id=str(uuid.uuid4()),
        description="Implement JWT authentication",
        phase=Phase.DEVELOPMENT,
        blocks=[],
        blocked_by=[],
        business_impact=9.0,
        estimated_hours=4.0
    )
]

plan = orchestrator.orchestrate(tasks)
```

## Next Steps

- Read [Architecture Overview](architecture.md) to understand how components fit together
- Explore [PAL Deep Dive](pal.md) for intent compilation
- Learn about [RAG DAL](ragdal.md) for knowledge retrieval
- Understand [NPAO](npao.md) for task orchestration
- See [Examples](../examples/) for real-world implementations

## Troubleshooting

### "No module named 'anthropic'"
```bash
pip install anthropic
```

### "ANTHROPIC_API_KEY not found"
Create a `.env` file with your API key.

### Agent not executing tasks
Check that the agent is registered:
```python
agents = hub.registry.list_all()
print(agents)
```

## Getting Help

- [GitHub Discussions](https://github.com/rostr-ai/rostr/discussions)
- [Discord](https://discord.gg/rostr)
- [Documentation](https://docs.rostr.ai)
