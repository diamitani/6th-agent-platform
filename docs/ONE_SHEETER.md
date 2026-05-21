# 6thAgent — One-Sheeter
> *Your sixth man.*

---

## The Pitch (3 seconds)

**Describe what you need. Get a working agent.**

Not a template. Not a prompt library. You type what you want an agent to do — in plain English — and 6thAgent builds it. System prompt, triggers, behavior profile, output format. Ready to chat in one click.

---

## The Problem

Building an AI agent today means:
- Writing and rewriting system prompts until they work
- Copying templates from Notion docs and GitHub repos
- Wiring up APIs, managing threads, debugging hallucinations
- Starting from scratch every time you need a new agent
- Paying for multiple AI subscriptions because no single tool does it all

**Result:** Most people never build the agent team they need. They settle for ChatGPT.

---

## The Solution

6thAgent is a **natural language agent compiler**. You describe what you need. We build the agent.

### How it works (what users see)

| Step | What happens |
|------|-------------|
| **1. Describe** | Type what you need: "I need an agent that sends 30 personalized DMs per day across Instagram, LinkedIn, and Twitter. It should follow a 3-touch sequence and require my approval." |
| **2. We build it** | Our compiler extracts the domain (Sales), detects constraints (approval required), identifies triggers (DM, Outreach), and generates a complete system prompt with behavior rules, output format, and edge case handling. |
| **3. Chat with it** | Your agent is on your roster. Chat immediately. Toggle between Ollama (free, local) or Gemini (free tier) — no vendor lock-in. |
| **4. Refine** | Not quite right? Edit the system prompt directly or describe a change. The compiler updates the agent. |

### What you don't see (and don't need to care about)

- **Intent extraction** — We parse your description into structured requirements
- **Context injection** — Your org's knowledge base, ICP, and brand voice auto-load
- **Semantic enhancement** — Vague verbs become precise instructions
- **Runtime compilation** — A complete agent manifest with triggers, personality, constraints
- **Provider routing** — Works with any AI model. You pick (or use the free default)

---

## What You Get

| Feature | Details |
|---------|---------|
| **Agent Builder** | Describe what you need in natural language. We compile it. |
| **Pre-built Templates** | 9 agent archetypes: Chief of Staff, Marketing, DM, Research, Sales, Support, Social, Paid Ads, Builder |
| **Chat** | Real-time conversations with streaming responses |
| **Knowledge Base** | Shared context across all your agents |
| **Reference Hub** | Org identity, ICP, positioning — injected into every agent |
| **Free AI** | Ollama (local, $0) or Gemini (free tier). No API key required to start. |
| **ROSTR Architecture** | Phase-aware orchestration. Knowledge that compounds. No black box. |

---

## Pricing

| Tier | Price | What you get |
|------|-------|-------------|
| **Free** | $0 | 3 agents, 1 team, 10 KB docs, Ollama/Gemini |
| **Core** | $29/mo | 10 agents, 3 teams, 100 KB docs, unlimited chat |
| **Pro** | $99/mo | Unlimited everything, analytics, priority support |

All tiers: No vendor lock-in. Bring your own AI key or use the free defaults.

---

## Why 6thAgent?

| vs. | Chat-based AI | Template libraries | Agent frameworks |
|-----|--------------|-------------------|-----------------|
| **Setup time** | Instant — describe and go | Hours of customization | Days of configuration |
| **Memory** | Per-session only | None | Requires setup |
| **Team support** | Single agent | Single agent | Multiple agents, complex setup |
| **AI provider** | Fixed to one | None | Requires API key |
| **Cost to start** | Free (limited) | Free (limited) | Paid API keys |

---

## The Tech (for those who ask)

- **Frontend:** Next.js 15 + TypeScript + Tailwind
- **Compiler:** 5-stage natural language → agent manifest pipeline
- **AI:** Ollama (local) + Gemini (cloud) — switchable per session
- **Storage:** Supabase PostgreSQL with org-level isolation (RLS)
- **Architecture:** Multi-tenant, phase-aware, knowledge-compounding

---

## Current Status

**V1 — Live.** Core agent builder + chat working. Free to use.

**Next up:**
- Team collaboration (shared agents, permissions)
- Visual canvas (drag-and-drop agent workflows)
- Cloud deployment (one-click to Azure/Oracle/AWS)
- Marketplace (publish and sell agent templates)

---

*6thAgent — Your sixth man. Describe what you need. Get a working agent.*
