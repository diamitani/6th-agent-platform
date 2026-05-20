// ROSTR Framework — Core Engine for 6thAgent
// Runtime, Orchestration, State, Tools, Reference
// "Open Source Agent Team Operating System"

// ============================================================
// STAGE 1: PAL — Prompt Abstraction Layer
// ============================================================

export interface PALIntent {
  primary_intent: string
  domain: "code" | "design" | "research" | "ops" | "sales" | "content" | "deploy" | "debug"
  subject: string
  constraints: string[]
  desired_output: string
  urgency: "immediate" | "queued" | "scheduled"
  ambiguity_score: number
}

export interface PALManifest {
  runtime: {
    agent_type: "builder" | "researcher" | "reviewer" | "designer" | "deployer" | "debugger"
    model: string
    temperature: number
    max_parallel_tasks: number
    timeout_seconds: number
  }
  instructions: {
    system: string
    behavior_profile: "analytical" | "creative" | "operational" | "investigative"
    task_description: string
    completion_criteria: string[]
  }
  memory: {
    mode: "session" | "project" | "persistent"
    context_sources: string[]
  }
  output: {
    format: "markdown" | "json" | "code" | "action"
    verification: "none" | "test" | "human-review"
  }
}

export function compilePAL(intent: Partial<PALIntent>): PALManifest {
  return {
    runtime: {
      agent_type: "builder",
      model: "gemini-2.5-flash",
      temperature: 0.3,
      max_parallel_tasks: 2,
      timeout_seconds: 120,
    },
    instructions: {
      system: `You are a ${intent.domain || "general"} agent. Task: ${intent.primary_intent || "Execute the user's request."}`,
      behavior_profile: "operational",
      task_description: intent.primary_intent || "Complete the task as specified.",
      completion_criteria: [
        `Output: ${intent.desired_output || "Complete artifact"}`,
        "Verified against constraints",
      ],
    },
    memory: {
      mode: "session",
      context_sources: ["project", "org"],
    },
    output: {
      format: "markdown",
      verification: "none",
    },
  }
}

// ============================================================
// STAGE 2: NPAO — Navigate, Prioritize, Allocate, Orchestrate
// ============================================================

export type Phase5D = "pred" | "design" | "development" | "deployment" | "debugging"

export const PHASE_LABELS: Record<Phase5D, string> = {
  pred: "PreD (Research)",
  design: "Design",
  development: "Development",
  deployment: "Deployment",
  debugging: "Debugging",
}

export const PHASE_DESCRIPTIONS: Record<Phase5D, string> = {
  pred: "Determine IF to build before deciding HOW. Research-dominant, NO code written.",
  design: "Define WHAT to build and HOW it should behave. Architecture, UI, data models.",
  development: "Build it. Implementation, testing, code review.",
  deployment: "Ship it safely. CI/CD, staging, production deploy, monitoring.",
  debugging: "Fix what's broken. Root cause analysis FIRST, fix second.",
}

export interface NPAOPriority {
  phase_urgency: number    // 0-10
  dependency_impact: number // 0-10
  business_impact: number   // 0-10
  resource_efficiency: number // 0-10
}

export function calculateNPAOScore(priority: NPAOPriority): number {
  return (
    priority.phase_urgency * 0.35 +
    priority.dependency_impact * 0.30 +
    priority.business_impact * 0.25 +
    priority.resource_efficiency * 0.10
  )
}

export function getPhaseUrgency(phase: Phase5D, isProductionBug?: boolean): number {
  const base: Record<Phase5D, number> = {
    debugging: 10,
    deployment: 8,
    development: 6,
    design: 4,
    pred: 2,
  }
  let score = base[phase]
  if (phase === "debugging" && isProductionBug) score = 10
  if (phase === "deployment" && isProductionBug) score += 2
  if (phase === "development" && isProductionBug) score += 2
  if (phase === "pred" && isProductionBug) score += 3
  return Math.min(score, 10)
}

export function getPriorityLabel(score: number): string {
  if (score >= 7) return "Immediate"
  if (score >= 4) return "Queued"
  return "Backlog"
}

export function getPriorityColor(score: number): string {
  if (score >= 7) return "bg-red-500"
  if (score >= 4) return "bg-gold"
  return "bg-muted-foreground/30"
}

// ============================================================
// STAGE 3: RAG DAL — Dynamic Acquisition Layer
// ============================================================

export type SourceTier = 1 | 2 | 3

export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  source: {
    url: string
    tier: SourceTier
    credibility_score: number
  }
  confidence: number
  topics: string[]
}

export const TIER_WEIGHTS: Record<SourceTier, number> = {
  1: 1.0,  // Academic, official docs — Establish ground truth
  2: 0.75, // Major news, editorials — Contextualize
  3: 0.40, // Community, forums — Real-world signal
}

export function calculateConfidence(entry: KnowledgeEntry): number {
  return (
    entry.source.credibility_score * 0.35 +
    entry.source.tier * TIER_WEIGHTS[entry.source.tier] * 0.25 +
    entry.topics.length * 0.10
  )
}

// ============================================================
// STAGE 4: Reference Hub — State & Persistence
// ============================================================

export interface HubNamespace {
  path: string
  type: "project" | "org" | "team" | "global"
  permissions: "read" | "write" | "admin"
}

export interface HubEvent {
  type: "learning" | "decision" | "task_complete" | "checkpoint"
  agent_id: string
  namespace: string
  content: Record<string, unknown>
  timestamp: string
}

// ============================================================
// FPE — Finish, Process, Effective
// ============================================================

export const FPE = {
  FINISH: "Complete every request with a working artifact. No half-done work.",
  PROCESS: "Always run PAL → Plan → Reference → Build. Never skip a phase.",
  EFFECTIVE: "Output must be production-ready and shippable.",
}

// ============================================================
// 6thAgent Positioning (from ROSTR framework)
// ============================================================

export const ROSTR_POSITIONING = {
  tagline: "Your sixth man.",
  subtitle: "Open Source Agent Team Operating System",
  description:
    "A unified architecture for production-grade multi-agent systems with phase-aware orchestration and persistent knowledge compounding.",
  fpe: "Finish. Process. Effective.",
  phases: "PreD → Design → Development → Deployment → Debugging",
  promise: "Prompt → Production in <5 minutes",
}

export const ROSTR_COMPARISON = {
  langchain: { compilation: "Templates", rag: "Standard", phases: "Manual chains", state: "Session" },
  crewai: { compilation: "Role defs", rag: "External", phases: "Role-based", state: "Limited" },
  autogpt: { compilation: "Self-gen", rag: "None", phases: "None", state: "None" },
  rostr: { compilation: "5-stage PAL", rag: "3-tier multi-pass", phases: "5D + 4D scoring", state: "4-level hierarchy" },
}
