# Swarm Orchestration Engine

The 6th Agent swarm coordinates 10 specialized master agents using the NPAO framework (Navigate, Prioritize, Allocate, Orchestrate) across the 5D phases (PreD → Design → Development → Deployment → Debugging).

---

## Architecture

```
                    User Vision / Workflow
                           │
                           ▼
                  ┌─────────────────┐
                  │ TaskRouter      │
                  │ • Phase detect  │
                  │ • Template match│
                  │ • Subtask gen   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ SwarmCoordinator│
                  │ • Task dispatch │
                  │ • Agent select  │
                  │ • Dep tracking  │
                  │ • Status mgmt   │
                  └────────┬────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                  ▼
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │ Engineering│   │    AI      │   │  Product   │
  │   Agent    │   │   Agent    │   │   Agent    │
  └────────────┘   └────────────┘   └────────────┘
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │  Backend   │   │  Frontend  │   │  DevOps    │
  │   Agent    │   │   Agent    │   │   Agent    │
  └────────────┘   └────────────┘   └────────────┘
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │    QA      │   │  Security  │   │  Design    │
  │   Agent    │   │   Agent    │   │   Agent    │
  └────────────┘   └────────────┘   └────────────┘
```

---

## Core Components

### SwarmOrchestrator
The top-level orchestrator that manages product vision runs and workflow execution.

- `run_product_vision(vision)` — Decomposes a product vision into tasks across all 5D phases
- `orchestrate_workflow(description)` — Routes a workflow to the appropriate agents
- `get_run_status(run_id)` — Returns real-time status of all tasks in a run
- `cancel_run(run_id)` — Cancels an in-progress run

### SwarmCoordinator
Manages task lifecycle, agent selection, dependency resolution, and status tracking.

- `dispatch_task(task)` — Assigns a task to the best-suited agent based on workload
- `update_task_status(task_id, status)` — Updates task state and publishes events
- `resolve_dependencies(task_id)` — Checks if dependencies are met, marks BLOCKED if not
- `create_subtask(parent_id, ...)` — Creates and dispatches a subtask under a parent
- `get_agent_workload(agent_id)` — Returns active task count for an agent
- `get_task_graph()` — Returns the full task dependency graph

### TaskRouter
Routes tasks to agents based on phase, domain, and template patterns.

- `route(task)` — Decomposes a task into subtasks using templates or generic routing
- `suggest_agents(phase)` — Returns which agents handle a given 5D phase
- `suggest_phase(description)` — Detects the 5D phase from task description keywords

---

## Task Lifecycle

```
PENDING → ASSIGNED → IN_PROGRESS → REVIEW → COMPLETED
                    ↘ BLOCKED ↗
                    ↘ FAILED
```

- **PENDING** — Awaiting dispatch
- **ASSIGNED** — Allocated to an agent, not started
- **IN_PROGRESS** — Agent is actively working
- **REVIEW** — Awaiting review/approval
- **COMPLETED** — Done and verified
- **FAILED** — Execution error
- **BLOCKED** — Waiting on dependency

---

## NPAO Priority Scoring

```python
priority_score = (
    urgency * 0.35 +
    dependency_impact * 0.30 +
    business_impact * 0.25 +
    resource_efficiency * 0.10
)
```

---

## Built-in Task Templates

The TaskRouter includes pre-built templates for common workflows:

| Template | Description |
|----------|-------------|
| `build_saas_dashboard` | Decomposes SaaS dashboard build into 6 subtasks (design → API → frontend → signup → security → deploy) |
| `deploy_cloud_instance` | Cloud provisioning → stack deploy → verification |
| `add_channel_integration` | Design connector → implement adapter → test → document |
| `create_new_agent` | PAL intent spec → system instructions → registry → UI components |
| `run_security_audit` | Dependency scan → code review → infra review → remediation plan |

---

## API Endpoints

All swarm operations are accessible via the REST API:

```
POST   /api/swarm/run-vision          — Submit a product vision
POST   /api/swarm/workflow            — Submit a workflow
GET    /api/swarm/runs                — List active runs
GET    /api/swarm/runs/{run_id}       — Get run status
POST   /api/swarm/runs/{run_id}/cancel— Cancel a run
GET    /api/swarm/tasks               — Get task dependency graph
GET    /api/swarm/agents/{id}/workload— Get agent workload
```

---

## Multi-Channel Integration

The swarm can be triggered and monitored through multiple channels:

| Channel | Protocol | Setup Required |
|---------|----------|----------------|
| **WhatsApp** | Cloud API / Webhook | WhatsApp Business API token |
| **Signal** | signal-cli REST API | signal-cli container + phone registration |
| **Slack** | Events API + Bot Token | Slack app with bot scope |
| **Microsoft Teams** | Graph API | Azure AD app with Teams permissions |

Each channel adapter implements:
```python
class BaseChannel(ABC):
    async def connect(self) -> bool
    async def disconnect(self)
    async def send_message(self, message) -> bool
    async def listen(self, handler)
```

---

## Cloud Deployment

Agents can deploy the 6th Agent stack on:

| Provider | Free Tier | Affiliate Program |
|----------|-----------|-------------------|
| **Azure** | 12 months free + $200 credit | ✅ |
| **Oracle Cloud** | Always-free (2 AMD VMs) | ✅ |
| **AWS** | 12 months free (t2.micro) | ✅ |

Deployment options:
1. **Use existing instance** — SSH into your server, paste deployment script
2. **Generate new instance** — Swarm provisions a VM for you
3. **Guided signup** — Walk through free account creation with affiliate link
