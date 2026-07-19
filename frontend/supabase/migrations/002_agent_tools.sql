-- Composio tool arsenal per agent.
-- Stores toolkit slugs (e.g. {gmail, hubspot, slack}) selected in the builder.
alter table agents
  add column if not exists tools text[] not null default '{}';

comment on column agents.tools is 'Composio toolkit slugs this agent is armed with';
