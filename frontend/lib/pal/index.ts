// PAL Agent Compiler — The Engine
// Transforms natural language → structured, repeatable agent manifest
// Every agent creation runs through this 5-stage pipeline

import type { Agent } from "@/types"

// ============================================================
// STAGE 1: Intent Extraction
// ============================================================

export interface RawIntent {
  raw: string
  primary_intent: string
  domain: "marketing" | "sales" | "operations" | "content" | "research" | "support" | "finance" | "legal" | "music" | "custom"
  subject: string
  audience?: string
  constraints: string[]
  desired_output: string
  urgency: "immediate" | "queued" | "scheduled"
  ambiguity_score: number  // 0.0 (crystal clear) to 1.0 (total guess)
}

export function extractIntent(raw: string): RawIntent {
  const lower = raw.toLowerCase()
  
  // Domain detection — order matters: specific signals before broad ones.
  const domainMap: [RegExp, RawIntent["domain"]][] = [
    // Outreach/prospecting is sales even when it never says "sales"
    [/\bdms?\b|direct message|outreach|prospect|cold (?:email|call|dm)|follow[- ]?ups?|touch (?:sequence|point)|\d+[- ]?touch|book (?:a )?(?:meeting|demo|call)|reply rate|hot leads?|quota/i, "sales"],
    [/sales|convert|close|deal|pipeline|crm/i, "sales"],
    [/market|growth|campaign|channel|lead/i, "marketing"],
    [/operat|chief|staff|coordinat|manage/i, "operations"],
    [/content|write|copy|blog|post|email/i, "content"],
    [/research|competitiv|intel|analyz|data/i, "research"],
    [/support|ticket|help|faq|customer/i, "support"],
    [/finance|budget|forecast|revenue|cost/i, "finance"],
    [/legal|contract|complianc|review/i, "legal"],
    [/music|artist|release|dsp|playlist/i, "music"],
  ]

  const domain = domainMap.find(([re]) => re.test(lower))?.[1] || "custom"

  // Extract subject (what's being acted upon)
  const subjectMatch = raw.match(/(?:for|about|managing|handling|building)\s+(.+?)(?:\.|$)/i)
  const subject = subjectMatch?.[1]?.trim() || "general tasks"

  // Detect constraints
  const constraints: string[] = []
  if (/daily|per day|each day/i.test(lower)) constraints.push("daily cadence")
  if (/budget|cost|spend|$/i.test(lower)) constraints.push("budget constrained")
  if (/approval|review|sign.?off/i.test(lower)) constraints.push("requires approval")
  if (/automat|no human/i.test(lower)) constraints.push("fully automated")
  if (/platform|channel|instagram|twitter|linkedin/i.test(lower)) constraints.push("platform-specific")
  if (/team|collaborat|hand.?off/i.test(lower)) constraints.push("team collaboration")

  // Determine urgency
  const urgency: RawIntent["urgency"] =
    /immediate|urgent|asap|right now/i.test(lower) ? "immediate" :
    /schedule|plan|next week|monthly/i.test(lower) ? "scheduled" :
    "queued"

  // Calculate ambiguity (simple heuristic)
  const ambiguityWords = ["something", "stuff", "things", "maybe", "kind of", "sort of", "like"]
  const ambiguityScore = ambiguityWords.reduce((score, word) =>
    lower.includes(word) ? score + 0.15 : score, 0.2
  )

  return {
    raw,
    primary_intent: raw.split(".")[0] || raw,
    domain,
    subject,
    constraints,
    desired_output: `Complete ${subject} deliverables as specified`,
    urgency,
    ambiguity_score: Math.min(ambiguityScore, 1.0),
  }
}

// ============================================================
// STAGE 2: Context Injection
// ============================================================

export interface AgentContext {
  org_name?: string
  org_identity?: string
  org_icp?: string
  existing_agents: string[]
  knowledge_docs: string[]
  team_name?: string
  phase?: string
}

export function injectContext(intent: RawIntent, context: AgentContext): RawIntent & { context: AgentContext } {
  return { ...intent, context }
}

// ============================================================
// STAGE 3: Semantic Enhancement
// ============================================================

export interface EnhancedIntent extends RawIntent {
  enhanced_instruction: string
  completion_criteria: string[]
  triggers: string[]
  persona_traits: string[]
}

export function enhanceIntent(intent: RawIntent & { context?: AgentContext }): EnhancedIntent {
  const domainRoles: Record<string, string> = {
    marketing: "Marketing & Growth",
    sales: "Sales & Conversion",
    operations: "Operations & Orchestration",
    content: "Content & Creative",
    research: "Research & Intelligence",
    support: "Customer Support",
    finance: "Financial Analysis",
    legal: "Legal & Compliance",
    music: "Music & Artist Promotion",
    custom: "Agent",
  }

  const personaMap: Record<string, string[]> = {
    marketing: ["data-driven", "creative", "strategic", "channel-aware"],
    sales: ["persuasive", "persistent", "relationship-focused", "goal-oriented"],
    operations: ["organized", "systematic", "efficient", "detail-oriented"],
    content: ["creative", "voice-aware", "audience-focused", "brand-aligned"],
    research: ["analytical", "thorough", "curious", "evidence-based"],
    support: ["patient", "helpful", "solution-oriented", "empathetic"],
    custom: ["adaptable", "reliable", "thorough", "professional"],
  }

  const role = domainRoles[intent.domain] || "Agent"
  const traits = personaMap[intent.domain] || personaMap.custom

  // Build completion criteria from constraints
  const criteria = [
    `Complete ${intent.subject} deliverables`,
    ...intent.constraints.map((c) => `Respect constraint: ${c}`),
    `Output in specified format`,
    `Quality check passed`,
  ]

  // Build trigger words from domain + subject; outreach gets action triggers
  const isOutreach =
    intent.domain === "sales" && /\bdms?\b|direct message|outreach|prospect|follow[- ]?up|sequence/i.test(intent.raw)
  const triggers = isOutreach
    ? ["Outreach", "DM batch", "Follow-up", "Sequence"]
    : [
        intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1),
        ...intent.subject.split(/[\s,]+/).filter((w) => w.length > 3),
      ].slice(0, 5)

  return {
    ...intent,
    enhanced_instruction: `You are the ${role} for this organization. ` +
      `You handle ${intent.subject}. ${intent.constraints.length > 0 ? `Rules: ${intent.constraints.join(", ")}.` : ""} ` +
      `Always output in the required format. Be ${traits.join(", ")}.`,
    completion_criteria: criteria,
    triggers,
    persona_traits: traits,
  }
}

// ============================================================
// STAGE 4: Runtime Compilation → Agent Manifest
// ============================================================

export interface AgentManifest {
  name: string
  role: string
  emoji: string
  color: string
  system_prompt: string
  triggers: string[]
  domain: string
  persona_traits: string[]
  completion_criteria: string[]
  suggested_team?: string
  knowledge_links?: string[]
}

export function compileManifest(enhanced: EnhancedIntent): AgentManifest {
  const domainEmojis: Record<string, string> = {
    marketing: "📊", sales: "🤝", operations: "🎯", content: "✍️",
    research: "🔍", support: "🎧", finance: "💎", legal: "⚖️", music: "🎵", custom: "🤖",
  }

  const domainColors: Record<string, string> = {
    marketing: "#2563EB", sales: "#C96442", operations: "#C96442",
    content: "#059669", research: "#7C3AED", support: "#0891B2",
    finance: "#D97706", legal: "#57564F", music: "#DB2777", custom: "#262624",
  }

  // Generate name from intent
  const name = generateAgentName(enhanced)

  // Build system prompt using PAL structure
  const systemPrompt = buildSystemPrompt(enhanced, name)

  return {
    name,
    role: `${enhanced.domain.charAt(0).toUpperCase() + enhanced.domain.slice(1)} Agent`,
    emoji: domainEmojis[enhanced.domain] || "🤖",
    color: domainColors[enhanced.domain] || "#C96442",
    system_prompt: systemPrompt,
    triggers: enhanced.triggers,
    domain: enhanced.domain,
    persona_traits: enhanced.persona_traits,
    completion_criteria: enhanced.completion_criteria,
  }
}

function generateAgentName(enhanced: EnhancedIntent): string {
  const domainNames: Record<string, string> = {
    marketing: "Marketing Manager",
    sales: "Sales Agent",
    operations: "Chief of Staff",
    content: "Content Writer",
    research: "Research Agent",
    support: "Support Agent",
    finance: "Financial Analyst",
    legal: "Legal Reviewer",
    music: "Music Promoter",
    custom: "Custom Agent",
  }

  // Try to extract a name from the raw input
  const nameMatch = enhanced.raw.match(/(?:called|named|name is|name it)\s+["']?(\w+(?:\s+\w+)?)["']?/i)
  if (nameMatch) return nameMatch[1]

  // Specialized sales flavors
  if (enhanced.domain === "sales") {
    if (/\bdms?\b|direct message/i.test(enhanced.raw)) return "DM Outreach Agent"
    if (/cold (?:email|call)|outreach|prospect/i.test(enhanced.raw)) return "Outreach Agent"
    if (/follow[- ]?up|pipeline|crm/i.test(enhanced.raw)) return "Pipeline Agent"
  }

  return domainNames[enhanced.domain] || "Custom Agent"
}

function buildSystemPrompt(enhanced: EnhancedIntent, name: string): string {
  const role = enhanced.domain.charAt(0).toUpperCase() + enhanced.domain.slice(1)

  return `You are ${name}, the ${role} Agent for this organization.

## PRIMARY INSTRUCTION
${enhanced.enhanced_instruction}

## CORE RESPONSIBILITIES
- Handle all ${enhanced.domain} tasks and requests
- Operate with ${enhanced.persona_traits.join(", ")} approach
- ${enhanced.constraints.length > 0 ? `Follow these rules: ${enhanced.constraints.join("; ")}` : "Deliver high-quality output consistently"}
- Output in clear, structured format

## OPERATIONAL RULES
${enhanced.urgency === "immediate" ? "- Prioritize speed — deliver ASAP" : enhanced.urgency === "scheduled" ? "- Follow scheduled cadence" : "- Handle tasks as they come"}
- ${enhanced.ambiguity_score > 0.5 ? "Clarify ambiguous requests before proceeding" : "Execute with confidence — no clarification needed"}
- Always log decisions and learnings to the Reference Hub

## COMPLETION CRITERIA
${enhanced.completion_criteria.map((c) => `- [ ] ${c}`).join("\n")}

## OUTPUT FORMAT
- Start with a brief summary of what was done
- Provide the complete deliverable
- End with status and next steps

— Compiled by 6thAgent PAL v1.0`
}

// ============================================================
// STAGE 5: Full PAL Pipeline
// ============================================================

export function compileAgentFromNaturalLanguage(
  raw: string,
  context?: AgentContext
): { manifest: AgentManifest; enhanced: EnhancedIntent } {
  // Stage 1: Extract intent
  const intent = extractIntent(raw)

  // Stage 2: Inject context
  if (context) injectContext(intent, context)

  // Stage 3: Enhance
  const enhanced = enhanceIntent(intent)

  // Stage 4: Compile manifest
  const manifest = compileManifest(enhanced)

  return { manifest, enhanced }
}
