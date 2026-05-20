# CLAUDE.md — Pat Diamitani's Million Dollar Portfolio OS

> **This file is the operating system for every project I build.**
> Read this first. Always. Before writing a single line of code.

---

## 🧠 Who I Am

**Name:** Pat Diamitani  
**Day Job:** GTM AI & Automation Manager @ Atlas HXM  
**Side Identity:** President, Artispreneur, Inc. (C-Corp, Iowa)  
**Location:** Chicago, IL  
**Stack Reality:** Self-taught via YouTube. No formal CS. I ship anyway.  
**Mantra:** FPE — Finish. Process. Effective. I always ship.

---

## 🎯 The Mission

**Build a $1,000,000 ARR portfolio in 12 months.**

Every business I build hits one of these four targets:

| Tier | Users | Price | ARR |
|------|-------|-------|-----|
| **Volume** | 10,000 | $10/mo | $1,000,000 |
| **Core** | 1,000 | $100/mo | $1,000,000 |
| **Pro** | 100 | $1,000/mo | $1,200,000 |
| **Agency** | 10 clients | $10,000/mo | $1,200,000 |

**Every project is assigned ONE tier at kickoff. Non-negotiable.**

---

## 🔭 My Three Frameworks (FPE + PAL + ROSTR)

### FPE — Finish. Process. Effective.
My personal operating system. Three rules:
1. **Finish** — I complete what I start. Shipping > perfecting.
2. **Process** — Every build follows the 5-phase system. No skipping.
3. **Effective** — I measure success by ARR and real user feedback. Not likes.

### PAL — Prompt Abstraction Layer
Before I build anything, I run the PAL protocol:
1. **Parse** — What is the user actually asking for? (not what they said, what they meant)
2. **Abstract** — What's the simplest version of this that ships today?
3. **Layer** — What gets added in v1.1, v1.2, etc.?

PAL prevents scope creep. PAL keeps me on the money path.

**PAL Template:**
```
PARSE: The user wants [exact pain point].
ABSTRACT: The MVP is [1 sentence solution].
LAYER: v1 = [3 features max]. v1.1 = [everything else].
```

### ROSTR — Runtime Orchestration System for Tasks & Results
My AI agent execution framework. Every AI-powered feature I build runs through ROSTR.

**ROSTR Phases:**
```
R — Receive     → Intake user input (form, prompt, upload)
O — Orchestrate → Route to the right agent/tool
S — Synthesize  → Combine outputs into a unified result
T — Transform   → Format for display (PDF, HTML, JSON, email)
R — Return      → Deliver to user with action options
```

Every product I build has a ROSTR loop. If it doesn't, it's not a product — it's a script.

---

## 🏗️ The 5-Phase Build System

```
Phase 0: STRATEGY   → WHO + WHAT + WHY (2–3 hrs)
Phase 1: DESIGN     → Templates + Tech Stack locked (1.5–2 hrs)
Phase 2: COPY       → All words + schemas BEFORE code (2–3 hrs)
Phase 3: BUILD      → Code in order, no jumping (3–5 hrs)
Phase 4: DEPLOY     → Live URL on Vercel (30 min)
Phase 5: ITERATE    → Real users → feedback → v1.1
```

**Rule: Never write code until Phase 2 is complete.**

---

## 🧱 Locked Tech Stack

> Do not change this between projects. Consistency = speed.

| Layer | Tool |
|-------|------|
| Frontend | Next.js 15 + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| State | Zustand |
| Backend | Express.js (Node) or Next.js API routes |
| Database | Supabase + PostgreSQL |
| Auth | Supabase Auth or Clerk |
| Deploy (FE) | Vercel |
| Deploy (BE) | Railway.app |
| LLM | Claude API — `claude-sonnet-4-20250514` |
| Storage | Supabase Storage |
| Payments | Stripe |
| Monitoring | Sentry + Vercel Analytics |

---

## 💼 The Portfolio

### Active Projects

| # | Project | Tier | Target | Status |
|---|---------|------|--------|--------|
| 1 | **Artispreneur** | Core (1K × $100) | Musicians | 🔨 Building |
| 2 | **ArtistEPKs.com** | Volume (10K × $10) | Artists/Labels | 🔨 Building |
| 3 | **Atlas GTM Agency** | Agency (10 × $10K) | HR/GTM Teams | 🌱 Planning |
| 4 | **LiveBuildAI** | Core (1K × $100) | Creators | 🌱 Planning |
| 5 | **GencyAI** | Pro (100 × $1K) | Agencies | 🌱 Planning |

### Retired / Parked
- GoodBoyGoods (dropship) — parked, 60-day window passed
- RexxCoin / NFT — parked, focus elsewhere

---

## 📐 Project Brief Template (Phase 0)

Fill this out before ANY build starts:

```
PROJECT NAME:
TIER: [ ] Volume $10  [ ] Core $100  [ ] Pro $1K  [ ] Agency $10K

PAL ANALYSIS:
  PARSE: User pain point is ___
  ABSTRACT: MVP is ___
  LAYER: v1 features (3 max): 1. ___ 2. ___ 3. ___

ROSTR LOOP:
  R — User inputs: ___
  O — Routes to: ___
  S — Combines: ___
  T — Outputs as: ___
  R — Delivers via: ___

WHO: Exact user persona (1 sentence)
WHAT: What they can do on Day 1
WHY THEM: Why they pay
SUCCESS METRIC: [X] paying users by [date]
V1.1 LIST: (park here, don't build now)
```

---

## 🤖 Claude API Integration (Standard Pattern)

```typescript
// lib/claude.ts — use in every project
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runAgent(
  userInput: string,
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [...history, { role: "user", content: userInput }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
```

---

## 🗄️ Standard Database Pattern

```sql
-- Run in Supabase SQL editor for every project

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'core', 'pro', 'agency')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  input TEXT,
  output TEXT,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
```

---

## 💳 Stripe Pricing Pattern

Every product uses one of these four configs:

```typescript
// Tier 1: Volume
const VOLUME_PRICE = "$10/month"  // target: 10,000 users

// Tier 2: Core
const CORE_PRICE = "$100/month"   // target: 1,000 users

// Tier 3: Pro
const PRO_PRICE = "$1,000/month"  // target: 100 users

// Tier 4: Agency
const AGENCY_PRICE = "$10,000/month" // target: 10 clients
```

Always include a **Free tier** with hard limits (rate-limited, watermarked, or capped at X runs/mo). Free users are the top of your sales funnel.

---

## 🚀 Deploy Checklist (30 min target)

```
[ ] git push origin main
[ ] vercel.com → New Project → Select repo
[ ] Add all env vars in Vercel dashboard
[ ] Connect Supabase prod credentials
[ ] Run SQL migrations in Supabase
[ ] Enable RLS on all tables
[ ] Test live URL: sign up → use core feature → check DB
[ ] Set up Stripe webhook endpoint
[ ] Ship to 5 beta users same day
```

---

## 📣 Communication Protocol

**Announce → Execute → Ship → Follow Up**

1. **Announce** — Tell people before you build ("Building X. Goes live [date].")
2. **Execute** — Silent work sprint. No updates until shipped.
3. **Ship** — Post the live URL. One sentence: what it does.
4. **Follow Up** — DM the 5 people most likely to pay. Ask for feedback.

---

## 🔢 ARR Tracker

```
Portfolio Goal: $1,000,000 ARR by [12 months from start]

Project          | Tier    | Users | MRR     | ARR
-----------------|---------|-------|---------|----------
Artispreneur     | Core    |   0   | $0      | $0
ArtistEPKs.com   | Volume  |   0   | $0      | $0
Atlas GTM Agency | Agency  |   0   | $0      | $0
LiveBuildAI      | Core    |   0   | $0      | $0
GencyAI          | Pro     |   0   | $0      | $0
-----------------|---------|-------|---------|----------
TOTAL            |         |   0   | $0      | $0
```

Update this weekly. Every Friday.

---

## 🧭 Rules I Never Break

1. **PAL before building.** No skipping to code.
2. **One project in active build at a time.** Others in planning/iterate only.
3. **Ship in 2 weeks or cut scope.** Not 3. Not 4. Two weeks.
4. **v1.1 list exists for every project.** Park features, don't kill them.
5. **5 real users before writing new features.** Feedback first.
6. **Free tier always has a paywall.** Show value, then charge.
7. **ROSTR loop = the product.** If it doesn't run an agent, it's a landing page.
8. **FPE.** I finish. I have a process. It's effective.

---

## 📁 Folder Structure (Every Project)

```
/project-name
  /app                  → Next.js app router
    /api                → API routes
    /dashboard          → Protected pages
    /auth               → Sign in / sign up
  /components           → shadcn/ui + custom
  /lib
    claude.ts           → Anthropic SDK wrapper
    supabase.ts         → Supabase client
    stripe.ts           → Stripe helpers
  /hooks                → Zustand stores
  /types                → TypeScript interfaces
  CLAUDE.md             → This file (copied per project)
  .env.local            → Never commit this
  README.md             → Ship notes + live URL
```

---

*Last updated: May 2026*  
*FPE — Finish. Process. Effective. 🚀*
