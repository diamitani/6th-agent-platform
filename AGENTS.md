# 6th Agent — 10 Master Product Team Agents

The 6th Agent platform ships with **10 specialized master agents** that form a complete product development team. Each agent has domain-specific system instructions, responsibilities, and routing rules within the NPAO framework.

---

## The 10 Agents

| # | Agent | ID | Domain | Icon | Phase |
|---|-------|----|--------|------|-------|
| 1 | **Engineering Lead** | `engineering` | code | ⚙️ | All |
| 2 | **AI/ML Architect** | `ai` | research | 🤖 | Development |
| 3 | **Design Lead** | `design` | design | 🎨 | Design |
| 4 | **Development Lead** | `development` | code | 💻 | Development |
| 5 | **Backend Architect** | `backend` | code | 🖥️ | Development |
| 6 | **Frontend Architect** | `frontend` | design | 🎭 | Development |
| 7 | **Product Manager** | `product` | custom | 📋 | PreD |
| 8 | **DevOps Engineer** | `devops` | ops | 🚀 | Deployment |
| 9 | **QA Lead** | `qa` | code | ✅ | Debugging |
| 10 | **Security Engineer** | `security` | ops | 🔒 | All |
| 11 | **Skill Agent** | `skill` | custom | 🛠️ | All |

---

## 1. Engineering Lead (`engineering`)
**Domain:** code · **Stakes:** high · **Autonomy:** semi-autonomous

Architectural authority. Makes technical decisions about stack, patterns, and trade-offs. Resolves disputes between specialist agents. Owns technical roadmap and system health.

## 2. AI/ML Architect (`ai`)
**Domain:** research · **Stakes:** high · **Autonomy:** semi-autonomous

LLM integration strategy, RAG DAL tuning, prompt engineering patterns, model selection, embedding strategies, context window management, model benchmarking.

## 3. Design Lead (`design`)
**Domain:** design · **Stakes:** medium · **Autonomy:** semi-autonomous

Brand identity (Champion Orange #FF6B00), UI/UX design, component patterns, responsive design, agent canvas, NPAO boards, deployment wizards. WCAG 2.1 AA compliance.

## 4. Development Lead (`development`)
**Domain:** code · **Stakes:** high · **Autonomy:** semi-autonomous

Full-stack implementation, coordination between backend/frontend agents, code standards enforcement, test coverage, performance optimization, technical debt management.

## 5. Backend Architect (`backend`)
**Domain:** code · **Stakes:** high · **Autonomy:** semi-autonomous

FastAPI endpoints, WebSocket handlers, database schemas (Supabase PostgreSQL + pgvector), ROSTR framework implementation, API contracts, auth, integration connectors (MCP, REST, GraphQL).

## 6. Frontend Architect (`frontend`)
**Domain:** design · **Stakes:** medium · **Autonomy:** semi-autonomous

Next.js 15 App Router, real-time features (WebSocket/SSE), React component library (shadcn/ui), Zustand state management, visual agent canvas, MCP integration hub UI, Core Web Vitals optimization.

## 7. Product Manager (`product`)
**Domain:** custom · **Stakes:** high · **Autonomy:** semi-autonomous

Product vision and strategy, feature prioritization (impact/effort/risk framework), user stories with acceptance criteria, roadmap management across 5D phases, success metrics and OKRs.

## 8. DevOps Engineer (`devops`)
**Domain:** ops · **Stakes:** critical · **Autonomy:** semi-autonomous

Deployment pipelines (GitHub Actions, Vercel, Docker), multi-cloud infrastructure (Azure/Oracle/AWS), monitoring and observability, Terraform/OpenTofu provisioning, zero-downtime deployments, cost optimization.

## 9. QA Lead (`qa`)
**Domain:** code · **Stakes:** high · **Autonomy:** semi-autonomous

Testing strategy (unit/integration/e2e/performance), quality gates, bug tracking with severity classification, regression testing, automated CI/CD test execution, quality metrics reporting.

## 10. Security Engineer (`security`)
**Domain:** ops · **Stakes:** critical · **Autonomy:** semi-autonomous

Threat modeling, auth/authz review (JWT, OAuth, API keys), data encryption (at rest/in transit), SAST scanning, dependency vulnerability scanning, secrets detection, incident response, GDPR/SOC 2 compliance.

---

## Architecture

```
User Vision / Workflow
        │
        ▼
┌─────────────────────────────────────────────┐
│           Swarm Orchestrator                │
│  (NPAO: Navigate → Prioritize → Allocate)   │
└─────────────────────────────────────────────┘
        │
        ▼ (routes to)
┌─────────────────────────────────────────────┐
│           10 Master Agents                  │
│                                             │
│  engineering  ai  design  development       │
│  backend  frontend  product  devops         │
│  qa  security                               │
│                                             │
│  Each agent has:                            │
│  • System instructions (8-part JTBD)        │
│  • Domain-specific rules                    │
│  • Output format spec                       │
│  • Phase mapping                            │
└─────────────────────────────────────────────┘
        │
        ▼ (deliver)
┌─────────────────────────────────────────────┐
│      Multi-Channel Output                   │
│  WhatsApp · Signal · Teams · Slack · Web    │
└─────────────────────────────────────────────┘
```

## Routing Logic

Tasks are routed to agents based on:
1. **5D Phase** — PreD → Product, Design → Design, etc.
2. **Agent Workload** — Least-loaded available agent gets the task
3. **Domain Match** — Task content matched to agent domain expertise
4. **Dependency Resolution** — Blocked tasks wait for dependencies

## Source Code

Each agent is defined in `backend/rostr/agents/{agent_id}.py` with:
- `system_instructions` — Complete 8-part system prompt
- `id` / `name` — Agent identifier
- `domain` — Expertise classification
- `autonomy_level` — Supervision requirement
- `state_requirement` — Memory persistence needs
- `stakes` — Impact of failure
