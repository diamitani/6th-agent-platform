# AGENT BUILDER — Full Stack Build Instructions
## Prompt Guide for Claude / Cursor / v0 / Windsurf

> FPE — Finish. Process. Effective.
> Use these prompts in order. One phase at a time. Don't skip.

---

## WHAT YOU'RE BUILDING

**Agent Builder** — A standalone SaaS dashboard to create, manage, and deploy AI agents for any business.

Features:
- Dashboard with NPAO canvas + quick commands
- Agent roster (create, edit, delete agents)
- Agent Builder (name, role, system prompt, PAL/NPAO protocols, triggers)
- Knowledge Base (RAG-ready documents per agent)
- Storage (prompts, templates, schemas, outputs)
- Test Chat (run any agent live with Claude API)
- Settings (API keys, product config)

**Revenue Tier:** Core ($100/mo, 1,000 users = $1M ARR)  
**Stack:** Next.js 15 + Supabase + Claude API + Stripe + Vercel

---

## PHASE 0 — PROJECT SETUP PROMPT

Use this prompt first in Claude or Cursor:

```
I am building a standalone SaaS app called "Agent Builder" — a dashboard to create, 
manage, and deploy AI agents powered by Claude API.

Tech stack:
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- Anthropic Claude API (claude-sonnet-4-20250514)
- Stripe for payments
- Vercel for deployment
- Zustand for state

Brand:
- Primary Red: #C0272D
- Gold: #F5C100  
- Parchment bg: #F9F6EF
- Charcoal text: #1A1A1A
- Font: Playfair Display (headings) + Lato (body)

Set up the project:
1. Create Next.js 15 app with TypeScript and Tailwind
2. Install: @supabase/supabase-js @anthropic-ai/sdk stripe zustand @stripe/stripe-js
3. Init shadcn/ui
4. Create the folder structure below
5. Set up .env.local with all required variables

Folder structure:
/app
  /page.tsx                    (landing page)
  /dashboard/page.tsx          (protected main dashboard)
  /dashboard/agents/page.tsx   (agent roster)
  /dashboard/builder/page.tsx  (create/edit agent)
  /dashboard/knowledge/page.tsx (knowledge base)
  /dashboard/storage/page.tsx  (file storage)
  /dashboard/chat/page.tsx     (test agent)
  /dashboard/settings/page.tsx
  /auth/login/page.tsx
  /auth/signup/page.tsx
  /api/chat/route.ts           (Claude API route)
  /api/stripe/webhook/route.ts
/components
  /ui/                         (shadcn)
  /layout/Sidebar.tsx
  /layout/Header.tsx
  /agents/AgentCard.tsx
  /agents/AgentBuilder.tsx
  /chat/ChatWindow.tsx
  /kb/DocCard.tsx
/lib
  /claude.ts
  /supabase.ts
  /stripe.ts
/hooks
  /useAgents.ts
  /useKnowledge.ts
  /useStorage.ts
/types
  /index.ts

Give me the complete setup commands and base files.
```

---

## PHASE 1 — DATABASE SCHEMA PROMPT

```
Create the Supabase PostgreSQL schema for Agent Builder. 
Run this in the Supabase SQL editor.

Requirements:
- Users with email, tier (free/core/pro/agency), stripe IDs
- Agents with: name, role, emoji, color, tier, description, system_prompt, 
  pal_protocol, npao_notes, persona, triggers (array), created_at
- Knowledge base docs with: title, type, content, source, tags, user_id, agent links
- Storage files with: name, type, content, description, file_url, size
- Agent-KB linking table (many-to-many)
- Agent conversations for chat history
- All tables need RLS enabled
- All tables owned by auth.uid()

Give me:
1. Complete CREATE TABLE statements
2. All foreign keys and constraints  
3. RLS policies for each table
4. Indexes for performance
5. Storage bucket creation for file uploads
```

---

## PHASE 2 — TYPES PROMPT

```
Create /types/index.ts with complete TypeScript interfaces for Agent Builder.

Include types for:
- User (id, email, tier, stripeCustomerId, stripeSubscriptionId, createdAt)
- Agent (id, userId, name, role, emoji, color, tier, description, systemPrompt, 
  palProtocol, npaoNotes, persona, triggers: string[], knowledgeDocIds: string[], createdAt)
- KnowledgeDoc (id, userId, title, type, content, source, tags: string[], createdAt)
- StorageFile (id, userId, name, type, content, description, fileUrl, size, createdAt)
- ChatMessage (id, agentId, userId, role: 'user' | 'assistant', content, createdAt)
- AgentTier: 'volume' | 'core' | 'pro' | 'agency'
- AgentRole: exact union of all 10 roles
- KBDocType: exact union of all 8 types
- FileType: exact union of all 7 file types
- NPAOCanvas (necessity, anxiety, priority, opportunity: string[] each)

Make all fields properly typed. Export everything.
```

---

## PHASE 3 — SUPABASE CLIENT PROMPT

```
Create /lib/supabase.ts — complete Supabase client with typed helper functions.

Include:
1. Client setup with env vars
2. Server-side client for API routes  
3. Typed CRUD for agents:
   - getAgents(userId)
   - getAgent(id)
   - createAgent(data)
   - updateAgent(id, data)
   - deleteAgent(id)
4. Typed CRUD for knowledge docs:
   - getKnowledgeDocs(userId)
   - createKnowledgeDoc(data)
   - deleteKnowledgeDoc(id)
5. Typed CRUD for storage files:
   - getStorageFiles(userId)
   - createStorageFile(data)
   - deleteStorageFile(id)
6. Chat history:
   - getChatHistory(agentId, limit)
   - saveChatMessage(data)
7. File upload to Supabase Storage bucket
8. Error handling on all functions

Use the types from /types/index.ts
```

---

## PHASE 4 — CLAUDE API ROUTE PROMPT

```
Create /app/api/chat/route.ts — the Claude API route for Agent Builder.

Requirements:
1. POST handler that accepts:
   - agentId: string
   - messages: {role, content}[]
   - userId: string

2. Fetch agent from Supabase including linked KB docs
3. Build system prompt:
   - Start with agent.systemPrompt
   - Append any linked KB doc content with labels
   - Include PAL protocol if set
   - Include NPAO notes if set

4. Call Claude API:
   model: claude-sonnet-4-20250514
   max_tokens: 1000
   Use streaming (ReadableStream) for real-time response

5. Save conversation to chat_history table in Supabase

6. Return streamed response to frontend

7. Handle errors gracefully — return JSON error with status

Include proper TypeScript types. Use Anthropic SDK not fetch directly.
```

---

## PHASE 5 — SIDEBAR + LAYOUT PROMPT

```
Create the app layout for Agent Builder.

Files to create:
1. /components/layout/Sidebar.tsx
2. /components/layout/DashboardLayout.tsx  
3. /app/dashboard/layout.tsx (uses DashboardLayout, protects routes)

Sidebar requirements:
- Brand colors: bg #1A1A1A, active item #C0272D, inactive text #aaa
- Logo: Red "A" in gold circle, "Agent Builder" text, "by Artispreneur OS" subtitle
- Nav items with icons: Dashboard, Agents, Builder, Knowledge Base, Storage, Test Agent, Settings
- Bottom: show agent count in gold (#F5C100) Playfair Display font
- Responsive: collapses on mobile

DashboardLayout requirements:
- Sidebar on left (220px fixed)
- Main content area: padding 32px 36px, bg #F9F6EF
- Header bar: user email, tier badge, sign out button

Auth protection:
- Check Supabase session in layout
- Redirect to /auth/login if no session
- Use next/navigation not window.location

Font: Import Playfair Display + Lato from Google Fonts in layout.tsx
```

---

## PHASE 6 — AGENT BUILDER COMPONENT PROMPT

```
Create /components/agents/AgentBuilder.tsx — the full agent creation/editing form.

This is the most important component. Requirements:

LEFT COLUMN:
1. Identity section:
   - Agent Name (text input)
   - Role Type (select from 10 roles: Chief of Staff, Marketing Manager, Content Writer, 
     DM Agent, Social Media, Promotions, Research, Paid Ads, Sales, Builder)
   - Revenue Tier (select: volume/core/pro/agency)
   - Short Description (textarea, 2 rows)

2. Appearance section:
   - Emoji picker (15 options, highlight selected)
   - Color picker (7 brand colors as circles)

3. Trigger Words section:
   - Input + Add button
   - Enter key adds trigger
   - Renders as removable tags

4. Knowledge Base Links section:
   - Checkbox list of all KB docs from Supabase
   - Shows doc type badge next to each

RIGHT COLUMN:
5. System Prompt (large textarea, 14 rows)
   - Label: "System Prompt (Soul)"
   - Placeholder shows template format
   
6. PAL Protocol (textarea, 4 rows)
   - Shows PARSE/ABSTRACT/LAYER format

7. NPAO Notes (textarea, 4 rows)
   - Shows N/A/P/O format

8. Persona (textarea, 3 rows)

FOOTER:
9. Save/Create button (disabled if name or systemPrompt empty)
10. Shows "Saved!" confirmation for 2 seconds after save

State: Use Zustand store or React state
On save: Call Supabase createAgent or updateAgent
After save: Navigate to /dashboard/agents

Use Artispreneur brand colors throughout. Tailwind + shadcn/ui.
```

---

## PHASE 7 — KNOWLEDGE BASE PAGE PROMPT

```
Create /app/dashboard/knowledge/page.tsx — the Knowledge Base management page.

Requirements:
1. Header: title "Knowledge Base", subtitle, "+ Add Document" button

2. Search bar: full width, filters docs by title/content/type in real-time

3. Type filter pills: All, SOUL, Agent, ICP, GTM, Competitor, Product, Playbook, Research
   - Active pill: #C0272D bg, white text
   - Inactive: transparent with border

4. Add Document form (shown/hidden via toggle):
   - Title input
   - Type select (8 options)
   - Source URL input (optional)
   - Content textarea (6 rows)
   - Cancel + Save buttons
   - Validate: title and content required

5. Document cards (list layout):
   - File icon (40px colored circle)
   - Title + type badge + date (right-aligned)
   - Content preview (150 chars truncated)
   - Source link if provided
   - Delete button

6. Empty state: icon + message when no docs

7. Each doc type has a distinct color:
   SOUL: #C0272D, Agent: #3b82f6, ICP: #22c55e, GTM: #f97316,
   Competitor: #8b5cf6, Product: #F5C100, Playbook: #06b6d4, Research: #ec4899

Data: Load from Supabase on mount with useEffect. Show loading skeleton.
CRUD: Create + delete with optimistic UI updates.
```

---

## PHASE 8 — CHAT/TEST AGENT PAGE PROMPT

```
Create /app/dashboard/chat/page.tsx — the Test Agent chat interface.

Requirements:
1. Header: "Test Agent" title + agent selector (dropdown of all agents with emoji)

2. Agent info bar (shows when agent selected):
   - Colored bg (agent.color + 15% opacity)
   - Shows emoji, name, role, KB doc count
   - Dismisses and resets when agent changes

3. Message list (flex-col, scrollable, fills available height):
   - User messages: right-aligned, #C0272D bg, white text, 14px border radius
   - Assistant messages: left-aligned, #F9F6EF bg, charcoal text, border
   - Both use pre-wrap for formatting
   - Max width 72%
   
4. Empty state:
   - Agent emoji centered
   - "Say anything to [agent name]"
   - Trigger word buttons (first 4 triggers) — clicking fills the input

5. Loading state: "[Agent name] is thinking..." message

6. Error state: red bg error box with helpful message

7. Input area (fixed at bottom):
   - Textarea (2 rows, resizes)
   - Enter sends (Shift+Enter for newline)
   - Disabled when no agent selected or loading
   - Send button

8. System prompt builder:
   - Start with agent.systemPrompt
   - Fetch and append all linked KB docs
   - Format: "--- KNOWLEDGE BASE ---\n## Title (Type)\nContent"

9. API call:
   - POST to /api/chat
   - Include agentId, messages array, userId
   - Handle streaming response (display chunks as they arrive)
   - Save to Supabase chat history

Auto-scroll to bottom on new messages. Smooth.
```

---

## PHASE 9 — DASHBOARD HOME PROMPT

```
Create /app/dashboard/page.tsx — the main dashboard home.

Requirements:
1. Header: "Good morning, [first name] 👋" (from Supabase user)
   Subtitle: "Your agent team is standing by. Art Means Business."

2. Stats row (4 cards, equal width):
   - Agents count (icon 🤖, color #C0272D)
   - KB Docs count (icon 📄, color #3b82f6)
   - Files count (icon 🗂️, color #8b5cf6)
   - ARR Target: "$1M" (icon 🎯, color #F5C100)
   Each: centered, large number in Playfair Display, label below

3. Two-column grid below:
   
   LEFT — NPAO Canvas (2/3 width):
   - Title "NPAO Canvas" + "This Week" badge
   - 4 sections: Necessity (red), Anxiety (orange), Priority (blue), Opportunity (gold)
   - Each section: colored label + 2 bullet items (hardcoded for v1, editable in v1.1)
   - Items pulled from most recent NPAO from Supabase (or default placeholder)

   RIGHT — Quick Commands (1/3 width):
   - Title "Quick Commands"
   - List of 6 commands: "Triage", "Status", "DM batch", "Content drop", "Ad copy", "Research"
   - Each row: red monospace command on left, gray description on right
   - Clicking copies command to clipboard (toast confirmation)

4. Second row: Recent Agents (last 3 created)
   - Mini agent cards: emoji, name, role, tier badge
   - "View all" link → /dashboard/agents

Fetch real data from Supabase. Show loading skeletons.
```

---

## PHASE 10 — AUTH PAGES PROMPT

```
Create auth pages for Agent Builder using Supabase Auth.

Files:
1. /app/auth/login/page.tsx
2. /app/auth/signup/page.tsx
3. /app/auth/callback/route.ts (Supabase OAuth callback)

Design:
- Centered card on parchment (#F9F6EF) background
- Logo: red "A" in gold circle, "Agent Builder" title, "Art Means Business." tagline
- Clean form: email + password inputs
- Primary button: #C0272D
- Toggle between login/signup with link

Login page:
- Email + password
- "Sign in" button
- Forgot password link (v1.1 — just show "coming soon")
- "Don't have an account? Sign up" link
- Error message display

Signup page:
- Email + password + confirm password
- Validate passwords match (client-side)
- "Create account" button
- "Already have an account? Sign in" link
- On success: redirect to /dashboard

Supabase Auth:
- Use @supabase/auth-helpers-nextjs
- Set up PKCE flow
- Handle OAuth callback in /auth/callback/route.ts
- Store session in cookies (SSR compatible)
- Show loading state during auth
```

---

## PHASE 11 — STRIPE INTEGRATION PROMPT

```
Add Stripe subscription payments to Agent Builder.

Pricing:
- Free tier: 3 agents, 10 KB docs, no chat API
- Core ($99/mo): unlimited agents, unlimited KB, chat API
- Pro ($299/mo): everything + white-label + priority support

Files to create:
1. /lib/stripe.ts — Stripe client + helper functions
2. /app/api/stripe/create-checkout/route.ts — create checkout session
3. /app/api/stripe/webhook/route.ts — handle subscription events
4. /app/api/stripe/portal/route.ts — customer portal link
5. /components/billing/PricingCard.tsx — pricing UI

Webhook events to handle:
- checkout.session.completed → update user.tier in Supabase
- customer.subscription.updated → update tier
- customer.subscription.deleted → downgrade to free

Middleware:
- Check user.tier before allowing access to premium features
- Redirect to /pricing if over free tier limits
- Show upgrade prompts inline when limits hit

Create /app/pricing/page.tsx:
- 3 pricing cards side by side
- Free / Core / Pro
- Feature list per tier
- "Get started" → Stripe checkout
- Annual toggle (20% discount)
```

---

## PHASE 12 — DEPLOY PROMPT

```
Prepare Agent Builder for production deployment on Vercel + Supabase.

Create these files:
1. .env.example (all required env vars with descriptions)
2. vercel.json (config)
3. /scripts/seed.sql (seed data for new users)
4. README.md (setup + deploy instructions)

Required environment variables:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_CORE_PRICE_ID=
STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_APP_URL=

Deployment checklist (generate a .md file):
[ ] GitHub repo created and pushed
[ ] Supabase project created (free tier)
[ ] SQL schema + RLS policies applied
[ ] Supabase Auth configured (email/password enabled)
[ ] Storage bucket created (public: false)
[ ] Stripe account + products created
[ ] Stripe webhook endpoint registered (use /api/stripe/webhook)
[ ] Vercel project created from GitHub repo
[ ] All env vars added to Vercel
[ ] Custom domain configured (optional)
[ ] Test full flow: signup → create agent → test chat → upgrade

Give me all files + the checklist.
```

---

## BONUS: V1.1 FEATURES PROMPT

Save these for after v1 ships and you have real users:

```
Agent Builder v1.1 — add these features based on user feedback.

Features to add (in priority order):
1. NPAO Canvas editor on dashboard (editable, saved to Supabase)
2. Agent templates library (pre-built agents: Chief of Staff, DM Agent, etc.)
3. Agent export (download as AGENT.md file)
4. Import AGENT.md (parse and create agent from markdown)
5. Knowledge Base RAG search (pgvector similarity search)
6. File upload to Supabase Storage (PDFs, images, docs)
7. Agent analytics (messages sent, responses, usage by agent)
8. Team mode (invite collaborators, shared agent library)
9. Agent scheduling (run agents on a cron schedule)
10. Webhook output (agent sends results to n8n, Zapier, etc.)

Implement #1 and #2 first. The rest are v1.2.
```

---

## USING THIS IN CURSOR / WINDSURF

**Start of every session:**
```
We're building Agent Builder — a SaaS dashboard for AI agent management.
Stack: Next.js 15 + Supabase + Claude API + Stripe + Vercel
Brand: Red #C0272D, Gold #F5C100, Parchment #F9F6EF
Reading: CLAUDE.md + SOUL.md + AGENT_TEAM_ARTISPRENEUR.md

Current phase: [PHASE NUMBER]
Current task: [SPECIFIC TASK]
```

**When stuck:**
```
I'm stuck on [exact file/component].
Here's the error: [paste error]
Here's my current code: [paste code]
Give me a copy-paste fix with the file path.
```

**When adding a feature:**
```
v1.1 request: [feature name]
Add [specific feature] to [specific file].
Keep it simple — minimum code to ship.
```

---

## MANTRA

**FPE — Finish. Process. Effective.**

Ship the v1 artifact first. Test it. Get real feedback.  
Then use these prompts to build the full stack version.  
Do not build the full stack before validating the concept.  

**Phase order: Validate → Build → Deploy → Iterate**

Art Means Business. 🚀
