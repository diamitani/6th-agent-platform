# Sixth Agent — Your Sixth Man

**The command center that builds your team.** An agent builder wrapping a Claude/Hermes agentic runtime, optimized by the ROSTR framework (PAL compiler, NPAO orchestration, Reference Hub) — with Composio-powered tool integrations, an S3-backed knowledge base on AWS, and a dashboard that feels like directing an operation, not writing prompts.

> *"Your sixth man."* — The extra agent on your roster that changes the game.

**The feel:** ball's in your court. General of the army, master of the ship — you give the order, the platform executes. Easy. Useful. Powerful.

Built for the operator filling gaps with agents instead of headcount: the startup CEO, the solo founder, the small-team marketing leader, the new executive. Describe the outcome; PAL compiles the agent; Composio arms it; the Command Center shows your whole team at work.

[![GitHub](https://img.shields.io/badge/github-6thagent--platform-FF6B00?style=flat-square&logo=github)](https://github.com/diamitani/6th-agent-platform)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-brightgreen?style=flat-square)]()
[![Next](https://img.shields.io/badge/next-15-black?style=flat-square)]()

---

## Quick Start (5 minutes, $0)

### Option A: Free Local (Ollama — no API keys)

```bash
# Terminal 1: Install & start Ollama
curl -fsSL https://ollama.com/install.sh | bash
ollama pull llama3.2
ollama serve

# Terminal 2: Start 6thAgent
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Option B: Free Cloud (Gemini — faster)

```bash
# 1. Get free Gemini key → https://aistudio.google.com/apikey
# 2. Add to frontend/.env.local:
GEMINI_API_KEY=AIza...your-key

# 3. Start
cd frontend && npm install --legacy-peer-deps && npm run dev
```

### Database Setup

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/wkgcsxraertasnbfuwlm/sql/new)
2. Paste & run `frontend/docs/supabase-setup.sql`
3. Copy URL + anon key → `frontend/.env.local`

---

## Features

| Feature | Route | Status |
|---------|-------|--------|
| Landing page | `/` | ✅ |
| Auth (login/signup) | `/auth/*` | ✅ |
| **Command Center** (roster, NPAO mission queue, ops feed, arsenal) | `/dashboard/command` | ✅ |
| NPAO Canvas | `/dashboard` | ✅ |
| Agent Builder (3-step) | `/dashboard/builder` | ✅ |
| Agent Roster | `/dashboard/agents` | ✅ |
| Chat (Ollama ↔ Gemini toggle) | `/dashboard/chat` | ✅ |
| Visual Canvas Builder | `/dashboard/canvas` | ✅ |
| Mini IDE (code editor) | `/dashboard/ide` | ✅ |
| Agent Marketplace | `/marketplace` | ✅ |
| Cloud Deploy Wizard | `/dashboard/deploy` | ✅ |
| MCP Integration Hub | `/dashboard/mcp` | ✅ |
| 100+ Tool Integrations | `/dashboard/integrations` | ✅ |
| Knowledge Base | `/dashboard/knowledge` | ✅ |
| Reference Hub | `/dashboard/hub` | ✅ |
| Teams | `/dashboard/teams` | ✅ |
| System Logs | `/dashboard/logs` | ✅ |
| Workflow Guide | `/dashboard/guide` | ✅ |
| Onboarding Wizard | `/onboarding` | ✅ |
| Brand Preview | `/brand` | ✅ |

---

## Architecture

```
6thAgent/
├── frontend/          Next.js 15 + TypeScript + Tailwind
│   ├── app/           33 pages + API routes
│   ├── components/    React UI components
│   ├── lib/           AI router, MCP hub, Canvas, Cloud, Logger
│   ├── logs/          Auto-generated system logs (JSONL)
│   └── docs/          Database schema SQL
│
├── brand/             Brand identity & assets
│   ├── assets/        SVG logos (icon, horizontal, vertical)
│   └── guidelines/    BRAND.md — full guidelines
│
└── scripts/           Seed templates, automation
```

### ROSTR Architecture Applied

| Layer | Implementation |
|-------|---------------|
| **PAL** (Prompt Abstraction) | Agent Builder → system prompt compilation |
| **NPAO** (Necessity → Anxiety → Priority → Opportunity) | Command Center mission queue + backend orchestrator (`/api/tasks`) |
| **RAG DAL** (Retrieval Layer) | Knowledge Base → agent KB links |
| **Reference Hub** | Org identity + ICP + positioning + timeline; S3-backed namespaces (`docs/AWS_DEPLOYMENT.md`) |
| **Hermes Runtime** | Claude/Hermes agentic loop with Composio tool execution (`/api/runtime`) |
| **Tool Arsenal** | Composio integrations — 300+ apps with managed auth (`/api/integrations`) |
| **FPE Loop** | Ralph Wiggums — Ship → Test → Fix → Repeat |

---

## AI Providers (Toggle in Chat)

| Provider | Cost | Speed | Setup |
|----------|------|-------|-------|
| **Ollama** 🆓 | **$0** local | 5-20 tok/s | `ollama pull llama3.2` |
| **Gemini** 🆓 | Free tier | 50-100 tok/s | Set `GEMINI_API_KEY` in `.env.local` |
| **OpenAI** 💰 | Paid | 100+ tok/s | Set `OPENAI_API_KEY` |

---

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + Zustand
- **AI:** Ollama (local) + Gemini API (cloud) — switchable per session
- **Database:** Supabase PostgreSQL + Auth + RLS (multi-tenant)
- **UI:** shadcn/ui + custom design system
- **MCP:** Built-in integration hub + OAuth flow
- **Cloud Deploy:** Azure, Oracle Cloud, AWS (wizard + affiliate)
- **Deployment:** Vercel auto-deploy from GitHub

---

## Brand

6thAgent brand identity: `brand/` folder.

- **Logo:** The "6A" eye mark — inspired by CBS eye, Eye of Horus, championship ring
- **Color:** Champion Orange `#FF6B00`
- **Tagline:** *"Your sixth man."*
- **Voice:** Athletic, coach-like, champion mindset

---

## Contributing

1. Fork the repo
2. Read `ARCHITECTURE.md` (top-level)
3. Check `frontend/logs/` for system behavior
4. FPE loop: Ship → Test → Fix → Repeat

---

## License

MIT — Free to use, modify, and deploy.

---

*Built with the Ralph Wiggums Loop. Never stop shipping.* 🔴
