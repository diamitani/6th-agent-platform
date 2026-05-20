-- ============================================================
-- Rostr Agent Builder — Full Schema Setup
-- Paste this entire file into Supabase Dashboard > SQL Editor
-- Run with caution — creates 10 tables + RLS + indexes
-- ============================================================

-- 1. ORGANIZATIONS
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

-- 2. TEAMS
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  name text not null,
  description text,
  conventions_md text,
  created_at timestamptz default now()
);

-- 3. AGENT TEMPLATES
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

-- 4. AGENTS
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

-- 5. KNOWLEDGE DOCS
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

-- 6. AGENT-KB LINKS
create table if not exists agent_kb_links (
  agent_id uuid references agents(id) on delete cascade,
  doc_id uuid references knowledge_docs(id) on delete cascade,
  primary key (agent_id, doc_id)
);

-- 7. HUB EVENTS
create table if not exists hub_events (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references orgs(id) on delete cascade,
  agent_id uuid references agents(id),
  event_type text check (event_type in ('learning', 'decision', 'task_complete', 'checkpoint')),
  content jsonb,
  namespace text,
  created_at timestamptz default now()
);

-- 8. CHAT THREADS
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

-- 10. INTEGRATIONS
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
-- ROW LEVEL SECURITY
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

-- Drop existing policies first (safe to re-run)
drop policy if exists "Org owner access" on orgs;
drop policy if exists "Org member access teams" on teams;
drop policy if exists "Public templates" on agent_templates;
drop policy if exists "Org member access agents" on agents;
drop policy if exists "Org member access knowledge" on knowledge_docs;
drop policy if exists "Org member access links" on agent_kb_links;
drop policy if exists "Org member access events" on hub_events;
drop policy if exists "Org member access threads" on chat_threads;
drop policy if exists "Org member access messages" on chat_messages;
drop policy if exists "Org member access integrations" on integrations;

create policy "Org owner access" on orgs for all using (owner_id = auth.uid());
create policy "Org member access teams" on teams for all using (org_id in (select id from orgs where owner_id = auth.uid()));
create policy "Public templates" on agent_templates for select using (is_public = true);
create policy "Org member access agents" on agents for all using (org_id in (select id from orgs where owner_id = auth.uid()));
create policy "Org member access knowledge" on knowledge_docs for all using (org_id in (select id from orgs where owner_id = auth.uid()));
create policy "Org member access links" on agent_kb_links for all using (agent_id in (select id from agents where org_id in (select id from orgs where owner_id = auth.uid())));
create policy "Org member access events" on hub_events for all using (org_id in (select id from orgs where owner_id = auth.uid()));
create policy "Org member access threads" on chat_threads for all using (org_id in (select id from orgs where owner_id = auth.uid()));
create policy "Org member access messages" on chat_messages for all using (thread_id in (select id from chat_threads where org_id in (select id from orgs where owner_id = auth.uid())));
create policy "Org member access integrations" on integrations for all using (org_id in (select id from orgs where owner_id = auth.uid()));

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

-- ============================================================
-- SEED DEFAULT AGENT TEMPLATES (20 agents)
-- ============================================================

insert into agent_templates (name, role, emoji, color, description, category, system_prompt, triggers, is_public) values
  ('Chief of Staff', 'Orchestrator', '🎯', '#C0272D', 'Runs NPAO triage, weekly reports, priority management', 'Operations', 'You are the Chief of Staff. Output: MRR, users, shipped, blocked, next 3 priorities.', '{Triage,Status,NPAO}', true),
  ('Marketing Manager', 'Growth', '📊', '#2563EB', 'Manages channels, campaigns, ICP targeting', 'Marketing', 'You manage all marketing. ICP: independent artists 22-35, 1K-100K followers.', '{Marketing,Channels,ICP}', true),
  ('Content Writer', 'Content', '✍️', '#059669', 'Writes content drops, email sequences, copy', 'Content', 'You are a content writer. Create compelling copy for emails, social, landing pages.', '{Content drop,Email sequence,Copy}', true),
  ('DM Agent', 'Outreach', '💬', '#7C3AED', 'Sends DMs, outreach sequences, follow-ups', 'Sales', 'Send 30 DMs/day. Platform priority: IG 60%, LinkedIn 30%, Twitter 10%.', '{DM batch,Outreach,30 DMs}', true),
  ('Social Media Manager', 'Social', '📱', '#D97706', 'Social posts, content calendar, engagement', 'Marketing', 'Manage social media. Post 3-5x/week per platform.', '{Social,Post,Content calendar}', true),
  ('Promotions Manager', 'Promotions', '🔥', '#DB2777', 'Runs promos, offers, launch campaigns', 'Marketing', 'You run promotions. A/B test subject lines and creatives.', '{Promo,Offer,Launch}', true),
  ('Research Agent', 'Research', '🔍', '#0891B2', 'Competitive research, ICP analysis, market intel', 'Operations', 'Conduct competitive analysis and market intelligence.', '{Research,Competitive,ICP research}', true),
  ('Paid Ads Manager', 'Advertising', '💰', '#65A30D', 'Google/Facebook Ads, campaigns, optimization', 'Marketing', 'Manage paid ads. CPC target < $1.50. CTR > 4%. CAC < $25.', '{Ad copy,Google Ads,Campaign}', true),
  ('Sales Agent', 'Sales', '🤝', '#C0272D', 'Converts leads, founding member outreach', 'Sales', 'Reach out to warm leads. Focus on value proposition.', '{Sales,Convert,Founding member}', true),
  ('Builder Agent', 'Development', '🏗️', '#1A1A1A', 'Ship features, FPE protocol, Ralph Wiggums Loop', 'Operations', 'Protocol: FPE — Finish. Process. Effective. Ralph Wiggums Loop. Never stop.', '{Product update,Ship,Launch mode}', true),
  ('Customer Support', 'Support', '🎧', '#059669', 'Support tickets, FAQs, satisfaction', 'Operations', 'Respond within 1 hour. Prioritize P0 < 30min, P1 < 2h, P2 < 24h.', '{Support,Ticket,FAQ}', true),
  ('Email Marketer', 'Email', '📧', '#D97706', 'Email sequences, newsletters, automation', 'Marketing', 'Build sequences: welcome, nurture, re-engagement.', '{Email,Newsletter,Automation}', true),
  ('Data Analyst', 'Analytics', '📈', '#2563EB', 'Metrics, reports, insights', 'Operations', 'Pull metrics, build reports, find trends.', '{Analysis,Report,Metrics}', true),
  ('Legal Reviewer', 'Legal', '⚖️', '#4A4A4A', 'Contracts, TOS, compliance', 'Legal', 'Review legal documents. Check liability, privacy, termination.', '{Contract,Legal review,Compliance}', true),
  ('Music Promoter', 'Music', '🎵', '#DB2777', 'Release promotion, playlists, DSP analytics', 'Music', 'Pitch playlists 6 weeks before release. Track streams, saves.', '{Release,Playlist,DSP}', true),
  ('Video Producer', 'Video', '🎬', '#7C3AED', 'Video scripts, shorts, content plans', 'Content', 'Format: hook (3s), value (middle), CTA (end).', '{Video,Script,Shorts}', true),
  ('Product Manager', 'Product', '📋', '#0891B2', 'Roadmap, specs, user stories', 'Operations', 'Write specs: problem, solution, success metrics.', '{Roadmap,Spec,User story}', true),
  ('Community Manager', 'Community', '👥', '#65A30D', 'Builds and engages community', 'Marketing', 'Daily: respond to 10 comments, post 2x, DM 5 members.', '{Community,Engagement,Event}', true),
  ('SEO Specialist', 'SEO', '🔎', '#2563EB', 'Search engine optimization', 'Marketing', 'On-page: meta, headers, links. Target: 10% MoM organic growth.', '{SEO,Keywords,Backlinks}', true),
  ('Financial Analyst', 'Finance', '💎', '#D97706', 'Financial planning, budgeting', 'Finance', 'Track: MRR, burn rate, runway, CAC, LTV.', '{Finance,Budget,Forecast}', true)
on conflict (id) do nothing;

-- ============================================================
-- VERIFICATION
-- ============================================================

select '✅ Schema setup complete' as status,
       (select count(*) from agent_templates) as templates_seeded;
