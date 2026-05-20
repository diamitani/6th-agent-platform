# ROSTR Architecture

## Overview

ROSTR is built on four layers with four primary components operating on a shared persistent hub.

## High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                    │
│  Natural Language Input | CLI | Dashboard | API              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   COMPILATION LAYER (PAL)                    │
│  Intent Extract → Context Inject → Enhance → Compile → Route│
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  DECISION LAYER (NPAO)                       │
│  Navigate(5D) → Prioritize(4D) → Allocate → Orchestrate     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTION LAYER                           │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐         │
│  │ Agents  │  │ RAG DAL  │  │   Rostr Hub         │         │
│  │         │  │          │  │   - Registry        │         │
│  │Builder  │  │3-Tier    │  │   - State Mgr       │         │
│  │Research │◄─┤Retrieval │◄─┤   - Reference       │         │
│  │Review   │  │Multi-Pass│  │   - Message Bus     │         │
│  │Deploy   │  │Coverage  │  │                     │         │
│  │Debug    │  │          │  │                     │         │
│  └─────────┘  └──────────┘  └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              PERSISTENCE LAYER (Reference Hub)               │
│  projects/ | orgs/ | teams/ | global/                       │
│  - Knowledge Bases (vector + metadata)                       │
│  - Decision Logs | Learnings | Checkpoints                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction Invariants

1. **PAL precedes execution** — All agent invocations flow through PAL compilation
2. **Phase classification precedes allocation** — NPAO must navigate task to 5D phase before allocation
3. **Knowledge retrieval goes through RAG DAL** — Centralized retrieval ensures credibility control
4. **State updates persist to reference hub** — Ensures knowledge compounding
5. **Cross-namespace access requires permission** — Ensures scoped context

## Information Flow

1. **User Input** → Natural language, JTBD, or API call
2. **PAL Compilation** → Intent extracted, context injected, enhanced, compiled to manifest
3. **NPAO Classification** → Task classified into 5D phase, priority scored, allocated to agent
4. **Agent Execution** → Agent receives instruction, invokes tools, may call RAG DAL
5. **RAG DAL** (if triggered) → Multi-pass retrieval, coverage assessment, KB ingestion
6. **State Persistence** → Results, decisions, learnings written to Reference Hub
7. **Output** → Artifact delivered to user, run logged

See [Research Paper](../paper/ROSTR_Research_Paper.md) for detailed technical specifications.
