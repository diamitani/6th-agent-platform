-- ============================================================
-- Rostr Agent Builder — Full Database Schema
-- Multi-tenant, ROSTR-compliant (orgs + teams + agents + hub)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. ORGANIZATIONS (each user gets one on signup)
create table if not exists orgs (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text unique,
  identity_md text,
  icp_md text,
  positioning_md text,
  npao_json jsonb,
  tier text default 'free' check (tier in ('free', 'core', 'pro', 'agency')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- 2. TEAMS (groups of agents within an org)
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  name text not null,
  description text,
  conventions_md text,
  created_at timestamptz default now()
);

-- 3. AGENT TEMPLATES (global templates anyone can clone)
create table if not exists agent_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  emoji text,
  color text,
  description text,
  system_prompt text,
  pal_protocol text,
  npao_notes text,
  triggers text[] default '{}',
  category text,
  is_public boolean default true,
  created_by uuid references auth.users(id),
  use_count int default 0,
  created_at timestamptz default now()
);

-- 4. AGENTS (user-owned instances)
create table if not exists agents (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  team_id uuid references teams(id),
  template_id uuid references agent_templates(id),
  name text not null,
  role text not null,
  emoji text default '🤖',
  color text default '#C0272D',
  description text,
  system_prompt text,
  pal_protocol text,
  npao_notes text,
  persona text,
  triggers text[] default '{}',
  openai_assistant_id text,
  ai_provider text default 'openai' check (ai_provider in ('openai', 'gemini', 'user_key')),
  capabilities text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. KNOWLEDGE DOCS (Reference Hub — persistent knowledge)
create table if not exists knowledge_docs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  namespace text not null default 'org',
  title text not null,
  doc_type text not null default 'Research',
  content text,
  source_url text,
  tags text[] default '{}',
  openai_file_id text,
  created_at timestamptz default now()
);

-- 6. AGENT <-> KNOWLEDGE LINKS
create table if not exists agent_kb_links (
  agent_id uuid references agents(id) on delete cascade,
  doc_id uuid references knowledge_docs(id) on delete cascade,
  primary key (agent_id, doc_id)
);

-- 7. HUB EVENTS (ROSTR state persistence — learnings, decisions, timeline)
create table if not exists hub_events (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  agent_id uuid references agents(id),
  event_type text check (event_type in ('learning', 'decision', 'task_complete', 'checkpoint')),
  content jsonb,
  namespace text,
  created_at timestamptz default now()
);

-- 8. CHAT THREADS (persistent OpenAI Assistants threads)
create table if not exists chat_threads (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade,
  org_id uuid references orgs(id),
  openai_thread_id text unique,
  title text,
  message_count int default 0,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- 9. CHAT MESSAGES
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text,
  created_at timestamptz default now()
);

-- 10. INTEGRATIONS (user-connected services)
create table if not exists integrations (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  integration_id text not null,
  name text not null,
  category text,
  auth_type text,
  config jsonb default '{}',
  connected boolean default false,
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  unique (org_id, integration_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================================

alter table orgs enable row level security;
alter table teams enable row level security;
alter table agent_templates enable row level security;
alter table agents enable row level security;
alter table knowledge_docs enable row level security;
alter table agent_kb_links enable row level security;
alter table hub_events enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table integrations enable row level security;

-- RLS Policies
create policy "Org owner access" on orgs for all using (owner_id = auth.uid());

create policy "Org member access teams" on teams for all using (
  org_id in (select id from orgs where owner_id = auth.uid())
);

create policy "Public templates" on agent_templates for select using (is_public = true);

create policy "Org member access agents" on agents for all using (
  org_id in (select id from orgs where owner_id = auth.uid())
);

create policy "Org member access knowledge" on knowledge_docs for all using (
  org_id in (select id from orgs where owner_id = auth.uid())
);

create policy "Org member access links" on agent_kb_links for all using (
  agent_id in (select id from agents where org_id in (select id from orgs where owner_id = auth.uid()))
);

create policy "Org member access events" on hub_events for all using (
  org_id in (select id from orgs where owner_id = auth.uid())
);

create policy "Org member access threads" on chat_threads for all using (
  org_id in (select id from orgs where owner_id = auth.uid())
);

create policy "Org member access messages" on chat_messages for all using (
  thread_id in (select id from chat_threads where org_id in (select id from orgs where owner_id = auth.uid()))
);

create policy "Org member access integrations" on integrations for all using (
  org_id in (select id from orgs where owner_id = auth.uid())
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_agents_org on agents(org_id);
create index if not exists idx_agents_team on agents(team_id);
create index if not exists idx_knowledge_org on knowledge_docs(org_id);
create index if not exists idx_hub_events_org on hub_events(org_id);
create index if not exists idx_chat_threads_agent on chat_threads(agent_id);
create index if not exists idx_chat_messages_thread on chat_messages(thread_id);
create index if not exists idx_integrations_org on integrations(org_id);
create index if not exists idx_agent_templates_category on agent_templates(category);
