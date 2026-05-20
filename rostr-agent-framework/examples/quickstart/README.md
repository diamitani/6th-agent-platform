# Rostr Quickstart Example

This example demonstrates the basic usage of the Rostr Agent Framework.

## Setup

```bash
pip install rostr-framework
```

## Basic Usage

### Example 1: Simple Task Execution

```python
from rostr.core import RostrHub
from rostr.agents import BuilderAgent

# Initialize hub
hub = RostrHub(workspace="my-project")

# Register a builder agent
builder = BuilderAgent(name="code-builder")
hub.register_agent(builder.to_definition())

# Execute a task
result = hub.execute(
    "Build a user authentication system with JWT tokens"
)

print(f"Phase: {result['phase']}")
print(f"Agent: {result['agent_type']}")
print(f"Intent: {result['compiled_intent']}")
```

### Example 2: Research with RAG DAL

```python
import asyncio
from rostr.ragdal import RAGDALPipeline

# Initialize pipeline
pipeline = RAGDALPipeline()

# Execute research
async def research():
    report = await pipeline.search(
        "What are best practices for API rate limiting?",
        namespace="my-project",
        mode="general_knowledge"
    )

    print(report.to_markdown())

asyncio.run(research())
```

### Example 3: Using PAL Alone

```python
from rostr.pal import PALCompiler

# Initialize compiler
compiler = PALCompiler()

# Compile vague input
instruction = compiler.compile(
    "fix the login bug",
    project_id="my-app"
)

print(f"Original: fix the login bug")
print(f"Enhanced: {instruction.enhanced_prompt}")
print(f"Phase: {instruction.route.agent_type}")
```

### Example 4: Multi-Agent with NPAO

```python
from rostr.npao import NPAOOrchestrator, Task, Agent, Phase
import uuid

# Initialize orchestrator
orchestrator = NPAOOrchestrator()

# Register agents
orchestrator.register_agent(Agent(
    id="builder-1",
    name="Builder Agent",
    type="builder",
    phases=[Phase.DEVELOPMENT],
    current_tasks=[],
))

orchestrator.register_agent(Agent(
    id="researcher-1",
    name="Research Agent",
    type="researcher",
    phases=[Phase.PRED],
    current_tasks=[],
))

# Create tasks
tasks = [
    Task(
        id=str(uuid.uuid4()),
        description="Research competitor pricing",
        phase=Phase.PRED,
        blocks=[],
        blocked_by=[],
        business_impact=7.0,
        estimated_hours=2.0
    ),
    Task(
        id=str(uuid.uuid4()),
        description="Build pricing page component",
        phase=Phase.DEVELOPMENT,
        blocks=[],
        blocked_by=[],
        business_impact=8.0,
        estimated_hours=4.0
    ),
]

# Orchestrate
execution_plan = orchestrator.orchestrate(tasks)
for item in execution_plan:
    print(f"{item['phase']}: {item['description']} -> {item['agent']}")
```

## CLI Usage

```bash
# Initialize workspace
rostr init my-project

# Add agents
rostr agent add --name builder --type builder
rostr agent add --name researcher --type researcher

# Execute task
rostr task "Research best practices for user authentication"

# Check status
rostr status
```

## What's Happening?

When you execute a task through Rostr:

1. **PAL** compiles your vague input into precise instructions
2. **NPAO** classifies the task into a 5D phase (PreD, Design, Development, Deployment, Debugging)
3. **RAG DAL** retrieves knowledge if research is needed
4. **NPAO** allocates the task to the best available agent
5. **State Manager** persists the work for future sessions

## Next Steps

- See [examples/gtm-ops](../gtm-ops/) for a real-world GTM operations agent
- See [examples/research-agent](../research-agent/) for a deep research pipeline
- Read the [documentation](../../docs/) for advanced usage
