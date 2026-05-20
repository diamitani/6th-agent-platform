# Rostr Setup Guide

Complete step-by-step guide to getting Rostr up and running.

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Installation

### Option 1: Install from PyPI (when published)

```bash
pip install rostr-framework
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/rostr-ai/rostr.git
cd rostr

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e .
```

## Configuration

### 1. Set Up API Keys

Create a `.env` file in your project directory:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional (for future features)
OPENAI_API_KEY=your_openai_key_here  # For embeddings
SUPABASE_URL=your_supabase_url  # For vector storage
SUPABASE_KEY=your_supabase_key  # For vector storage
REDIS_URL=redis://localhost:6379  # For caching
```

### 2. Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and paste into your `.env` file

### 3. Verify Installation

```bash
# Check version
rostr version

# Should output:
# Rostr Agent Framework v0.1.0
# Open Source Agent Team Operating System
```

## Quick Start

### Step 1: Initialize a Workspace

```bash
rostr init my-first-project
```

This creates:
- `rostr-data/` directory
- `projects/my-first-project/` workspace
- `README.md`, `goals.md`, `decisions.md` files

### Step 2: Add an Agent

```bash
# Add a builder agent for code tasks
rostr agent add --name code-builder --type builder

# Add a researcher agent for research tasks
rostr agent add --name research-assistant --type researcher
```

### Step 3: Run Your First Task

```bash
rostr task "Research best practices for API authentication"
```

You should see:
- Phase classification (likely PreD for research)
- Agent type assignment (researcher)
- Compiled intent
- Enhanced prompt
- Research results (if RAG DAL finds sources)

### Step 4: Check Status

```bash
rostr status
```

Shows:
- Active workspace
- Registered agents
- Recent activity

## Using the Python API

```python
from rostr.core import RostrHub
from rostr.agents import BuilderAgent, ResearcherAgent

# Initialize hub
hub = RostrHub(workspace="my-project")

# Register agents
builder = BuilderAgent(name="code-builder")
researcher = ResearcherAgent(name="research-assistant")

hub.register_agent(builder.to_definition())
hub.register_agent(researcher.to_definition())

# Execute tasks
result = hub.execute(
    "Build a user registration API endpoint with email verification"
)

print(f"Phase: {result['phase']}")
print(f"Agent: {result['agent_type']}")
print(f"Intent: {result['compiled_intent']}")
```

## Architecture Overview

When you run a task, here's what happens:

1. **PAL** compiles your vague input into precise instructions
2. **NPAO** classifies the task into one of 5 phases (PreD, Design, Development, Deployment, Debugging)
3. **RAG DAL** retrieves knowledge if research is needed
4. **NPAO** allocates the task to the best available agent
5. **Hub** persists the work in the reference hub for future sessions

## Directory Structure

After setup, your workspace looks like this:

```
rostr-data/
├── projects/
│   └── my-project/
│       ├── README.md          # Project overview
│       ├── goals.md           # Current objectives
│       ├── decisions.md       # Key decisions log
│       ├── knowledge-base/    # RAG DAL storage
│       └── timeline.jsonl     # Activity history
├── agents/                    # Registered agents
│   ├── builder-id.json
│   └── researcher-id.json
├── state/                     # State management
│   └── project_my-project/
└── knowledge/                 # Global knowledge base
```

## Advanced Configuration

### Custom Storage Path

```bash
rostr init my-project --path /custom/path/rostr-data
```

Or in Python:

```python
from pathlib import Path
hub = RostrHub(
    workspace="my-project",
    storage_path=Path("/custom/path/rostr-data")
)
```

### RAG DAL Configuration

Configure knowledge retrieval:

```python
from rostr.ragdal import RAGDALPipeline

pipeline = RAGDALPipeline(
    storage_path=Path("./rostr-data/knowledge"),
    confidence_threshold=0.8,  # How confident before returning results
    max_passes=3  # Maximum search iterations
)

# Execute research
import asyncio
result = asyncio.run(pipeline.search(
    "What are best practices for password hashing?",
    namespace="my-project",
    mode="general_knowledge"
))

print(result.to_markdown())
```

### NPAO Orchestration

For multi-agent teams:

```python
from rostr.npao import NPAOOrchestrator, Task, Agent, Phase
import uuid

orchestrator = NPAOOrchestrator()

# Register agents with NPAO
orchestrator.register_agent(Agent(
    id="builder-1",
    name="Builder Agent",
    type="builder",
    phases=[Phase.DEVELOPMENT, Phase.DEBUGGING],
    current_tasks=[]
))

# Create tasks
tasks = [
    Task(
        id=str(uuid.uuid4()),
        description="Research authentication libraries",
        phase=Phase.PRED,
        blocks=[],
        blocked_by=[],
        business_impact=7.0,
        estimated_hours=2.0
    )
]

# Orchestrate
plan = orchestrator.orchestrate(tasks)
for item in plan:
    print(f"{item['phase']}: {item['description']} -> {item['agent']}")
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'rostr'"

Solution:
```bash
pip install -e .
```

### "ANTHROPIC_API_KEY not found"

Solution: Create `.env` file with your API key or set environment variable:
```bash
export ANTHROPIC_API_KEY=your_key_here
```

### Agent not responding

Check agent registration:
```bash
rostr agent list
```

Or in Python:
```python
agents = hub.registry.list_all()
for agent in agents:
    print(f"{agent.name}: {agent.type}")
```

### RAG DAL not finding sources

This is expected in v0.1 - real web search integration is planned for v0.2. Currently returns mock results to demonstrate structure.

## Next Steps

- Read the [Quickstart Tutorial](docs/quickstart.md)
- Explore [Examples](examples/)
- Learn about [PAL](docs/pal.md), [RAG DAL](docs/ragdal.md), [NPAO](docs/npao.md)
- Join the [Discord community](https://discord.gg/rostr)

## Getting Help

- [GitHub Discussions](https://github.com/rostr-ai/rostr/discussions)
- [Discord](https://discord.gg/rostr)
- [Documentation](https://docs.rostr.ai)
- [Issue Tracker](https://github.com/rostr-ai/rostr/issues)
