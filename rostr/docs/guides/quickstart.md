# ROSTR Quickstart Guide

Get up and running with ROSTR in under 10 minutes.

## Installation

```bash
pip install rostr
```

## Basic Setup

### 1. Configure Environment

Create a `.env` file:

```bash
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url  # Optional for production
SUPABASE_KEY=your_supabase_key  # Optional for production
```

### 2. Initialize Reference Hub

```python
from rostr import Hub

hub = Hub.initialize(
    storage_backend="local",  # or "supabase" for production
    vector_db="chroma"         # or "pgvector" with Supabase
)

# Create your first project
project = hub.create_project(
    name="my-first-project",
    description="Getting started with ROSTR"
)
```

### 3. Register an Agent

```python
from rostr import Agent

agent = Agent.register(
    name="research-agent",
    type="researcher",
    capabilities=["web_search", "data_analysis"],
    phases=["PreD"],  # This agent handles PreD (research) phase
    model="claude-sonnet-4-6"
)
```

### 4. Run Your First Task

```python
from rostr import PAL, NPAO

# Compile natural language to agent manifest
manifest = PAL.compile(
    intent="Research top 3 competitor pricing models",
    project_id=project.id
)

# Route and execute
result = NPAO.execute(manifest)

print(result.output)
print(f"Confidence: {result.confidence}")
```

## Complete Example

```python
from rostr import Hub, Agent, PAL, NPAO

# Initialize
hub = Hub.initialize()
project = hub.create_project("demo")

# Register agent
agent = Agent.register(
    name="researcher",
    type="researcher",
    capabilities=["web_search", "data_analysis", "report_generation"],
    phases=["PreD"],
    model="claude-sonnet-4-6"
)

# Execute task
manifest = PAL.compile(
    intent="Research AI agent frameworks: LangChain, CrewAI, AutoGPT. Compare features.",
    project_id=project.id
)

result = NPAO.execute(manifest)
print(result.output)

# Knowledge is automatically persisted
knowledge = hub.query(
    project_id=project.id,
    query="agent frameworks comparison",
    limit=5
)
print(f"Knowledge entries: {len(knowledge)}")
```

## Next Steps

- [Architecture Overview](./architecture.md)
- [Component Documentation](../api/)
- [Examples](../../examples/)
- [Research Paper](../paper/ROSTR_Research_Paper.md)

## Common Patterns

### Multi-Phase Workflow

```python
# Task automatically decomposed into phases by NPAO
task = """
Add user authentication:
1. Research auth providers (PreD)
2. Design auth flow (Design)
3. Implement OAuth (Development)
4. Deploy with monitoring (Deployment)
"""

manifest = PAL.compile(intent=task, project_id=project.id)
result = NPAO.execute(manifest)  # Executes through all phases
```

### Knowledge Reuse

```python
# Session 1: Research
research_result = NPAO.execute(PAL.compile(
    intent="Research Stripe API",
    project_id=project.id
))

# Session 2: Implementation (different session, same project)
build_result = NPAO.execute(PAL.compile(
    intent="Implement Stripe billing",
    project_id=project.id
))
# Builder automatically loads Stripe research from knowledge base
```

### RAG DAL for Deep Research

```python
from rostr import RAGDAL

ragdal = RAGDAL(confidence_threshold=0.8, max_passes=4)
report = ragdal.retrieve("How does GPT-4 compare to Claude 3.5?")

print(f"Confidence: {report.confidence}")
print(f"Passes: {report.passes_run}")
print(f"Tier 1 sources: {report.tier1_count}")
```

## Troubleshooting

### Module Import Errors

```bash
# Ensure ROSTR is installed
pip install rostr

# Or install from source
git clone https://github.com/yourusername/rostr.git
cd rostr
pip install -e .
```

### API Key Issues

```bash
# Check environment variables
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Or load from .env
from dotenv import load_dotenv
load_dotenv()
```

### Vector DB Connection

```bash
# For Chroma (local)
pip install chromadb

# For pgvector (Supabase)
pip install supabase
```

## Support

- [Documentation](https://rostr.dev)
- [GitHub Discussions](https://github.com/yourusername/rostr/discussions)
- [Issues](https://github.com/yourusername/rostr/issues)
- Email: patrick@diamitani.com
