export interface User {
  id: string
  email: string
  tier: 'free' | 'core' | 'pro' | 'agency'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface Org {
  id: string
  owner_id: string
  name: string
  slug: string
  identity_md?: string
  icp_md?: string
  positioning_md?: string
  npao_json?: NPAOCanvas
  tier: 'free' | 'core' | 'pro' | 'agency'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface Team {
  id: string
  org_id: string
  name: string
  description?: string
  conventions_md?: string
  created_at: string
}

export interface AgentTemplate {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  description?: string
  system_prompt?: string
  pal_protocol?: string
  npao_notes?: string
  triggers: string[]
  category?: string
  is_public: boolean
  created_by?: string
  use_count: number
  created_at: string
}

export interface Agent {
  id: string
  org_id: string
  team_id?: string
  template_id?: string
  name: string
  role: string
  emoji: string
  color: string
  description?: string
  system_prompt?: string
  pal_protocol?: string
  npao_notes?: string
  persona?: string
  triggers: string[]
  openai_assistant_id?: string
  ai_provider: 'openai' | 'gemini' | 'user_key'
  capabilities: string[]
  is_active: boolean
  created_at: string
}

export interface KnowledgeDoc {
  id: string
  org_id: string
  namespace: string
  title: string
  doc_type: string
  content?: string
  source_url?: string
  tags: string[]
  openai_file_id?: string
  created_at: string
}

export interface AgentKBLink {
  agent_id: string
  doc_id: string
}

export interface HubEvent {
  id: string
  org_id: string
  agent_id?: string
  event_type: 'learning' | 'decision' | 'task_complete' | 'checkpoint'
  content: Record<string, unknown>
  namespace: string
  created_at: string
}

export interface ChatThread {
  id: string
  agent_id: string
  org_id: string
  openai_thread_id: string
  title?: string
  message_count: number
  last_message_at?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  thread_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface NPAOCanvas {
  phase: 'pred' | 'design' | 'development' | 'deployment' | 'debugging'
  priority_score: number
  current_focus?: string
  blocked_items: string[]
  next_actions: string[]
}

export type AIProvider = 'openai' | 'gemini' | 'user_key'

export interface ChatRequest {
  agentId: string
  message: string
  threadId?: string
}

export interface ChatResponse {
  response: string
  threadId: string
}
