// Enably GTM Skill Pack
// Ported from the Enably GTM Architect (enably-gtm-architect.manifest.json,
// ENABLY Product Specification, and the Enably tool sheets) into the 6thAgent
// skills system. Each skill is a structured, PAL-ready action: typed inputs
// compose into an enhanced execution prompt any agent (or Sixy) can run.

export interface SkillInput {
  id: string
  label: string
  placeholder: string
  required?: boolean
  multiline?: boolean
}

export interface Skill {
  id: string
  action: string
  name: string
  description: string
  category: "foundation" | "messaging" | "playbook" | "research"
  emoji: string
  inputs: SkillInput[]
  // {{input_id}} tokens are replaced with user values at run time
  promptTemplate: string
  outputFormat: string
}

export const ENABLY_PACK = {
  id: "enably-gtm",
  name: "Enably GTM Architect",
  version: "0.1.0",
  mission:
    "Help founders and revenue teams define, document, and launch a practical go-to-market system.",
  constraints: [
    "Favor operational clarity over jargon.",
    "Do not invent integrations that are not configured.",
    "Tie every recommendation back to the team's stage, offer, and target buyer.",
  ],
}

const COMMON_CONTEXT: SkillInput[] = [
  { id: "product", label: "Product / offer", placeholder: "What you sell, in one or two sentences", required: true, multiline: true },
  { id: "audience", label: "Target buyer", placeholder: "Who you sell to (role, company size, industry)", required: true },
]

export const ENABLY_SKILLS: Skill[] = [
  {
    id: "icp-creator",
    action: "setup_ideal_customer_profile",
    name: "ICP Creator",
    description: "Define your ideal customer profile — firmographics, pains, buying triggers, and disqualifiers.",
    category: "foundation",
    emoji: "🎯",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "stage", label: "Company stage", placeholder: "e.g. pre-seed, bootstrapped, Series A" },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Build an Ideal Customer Profile.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
STAGE: {{stage}}

Produce:
1. Firmographics — industry, company size, revenue band, geography, tech stack signals
2. The buying committee — economic buyer, champion, blockers
3. Top 5 pains (ranked) and the trigger events that surface them
4. Qualification criteria — 5 must-haves, 3 disqualifiers
5. Where to find them — channels, communities, watering holes

Favor operational clarity over jargon. Tie everything to the stage, offer, and target buyer.`,
    outputFormat: "Structured ICP document, ready to save to the knowledge base",
  },
  {
    id: "persona-creator",
    action: "create_user_personas",
    name: "User Persona Creator",
    description: "Turn your ICP into named personas with goals, objections, and message angles per persona.",
    category: "foundation",
    emoji: "👥",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "icp", label: "Existing ICP (optional)", placeholder: "Paste your ICP if you have one", multiline: true },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Create 3 user personas.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
ICP CONTEXT: {{icp}}

For each persona produce:
1. Name, title, seniority, team size
2. Goals and success metrics they are judged on
3. Daily friction your product removes
4. Top 3 objections and how to preempt each
5. The one-line message angle that gets a reply

Keep each persona to under 150 words. Operational clarity over jargon.`,
    outputFormat: "3 persona cards with message angles",
  },
  {
    id: "usp-mapper",
    action: "create_unique_selling_points",
    name: "USP Mapper",
    description: "Map unique selling points against competitors and buyer pains — positioning you can defend.",
    category: "foundation",
    emoji: "💎",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "competitors", label: "Competitors / alternatives", placeholder: "Who they'd use instead (including 'do nothing')" },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Map unique selling points.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
ALTERNATIVES: {{competitors}}

Produce:
1. 5 candidate USPs — each stated as buyer outcome, not feature
2. For each: the pain it maps to, the proof needed, and the competitor gap it exploits
3. A positioning statement: For [buyer] who [pain], [product] is the [category] that [outcome], unlike [alternative]
4. The 3 USPs to lead with and why

Tie every recommendation back to the team's stage, offer, and target buyer.`,
    outputFormat: "USP map + positioning statement",
  },
  {
    id: "use-case-mapper",
    action: "build_use_case_map",
    name: "Use Case Mapper",
    description: "Build the use-case map connecting personas to jobs-to-be-done to product capabilities.",
    category: "foundation",
    emoji: "🗺️",
    inputs: COMMON_CONTEXT,
    promptTemplate: `Act as the Enably GTM Architect. Build a use-case map.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}

Produce a table of the top 6 use cases. For each:
1. Persona and the job-to-be-done
2. Current painful workaround
3. How the product does it (capability, not feature name)
4. Time or money saved (estimate honestly)
5. The demo moment that proves it

Order by revenue impact. Operational clarity over jargon.`,
    outputFormat: "Use-case table ordered by revenue impact",
  },
  {
    id: "market-segmenter",
    action: "segment_market",
    name: "Market Segmenter",
    description: "Segment your market by demographics, behavior, and industry — with a beachhead recommendation.",
    category: "research",
    emoji: "📊",
    inputs: COMMON_CONTEXT,
    promptTemplate: `Act as the Enably GTM Architect. Segment the market.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}

Produce:
1. 4-6 market segments across demographics, behavior, and industry
2. For each: size signal, urgency of pain, willingness to pay, ease of reach
3. Score each segment 1-10 on fit
4. Recommend the beachhead segment and the sequencing for the next two
5. What evidence would change this recommendation

Do not invent data — flag estimates as estimates.`,
    outputFormat: "Segment scorecard + beachhead recommendation",
  },
  {
    id: "sales-playbook",
    action: "create_sales_playbook",
    name: "Sales Playbook Generator",
    description: "Generate the sales bible — activity targets, SOPs, qualification, cadences, and objection handling.",
    category: "playbook",
    emoji: "📕",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "motion", label: "Sales motion", placeholder: "e.g. outbound-led, PLG + sales assist, founder-led" },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Write a working sales playbook.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
SALES MOTION: {{motion}}

Produce:
1. Weekly activity targets (calls, emails, socials) sized for the motion
2. Qualification framework (pick MEDDICC-lite or BANT and adapt it)
3. Stage-by-stage SOP: prospect -> connect -> discover -> demo -> close
4. Cadence structure: touches, channels, spacing over 21 days
5. Top 5 objections with response frameworks
6. The metrics dashboard: leading and lagging indicators

Make it executable by one person on day one.`,
    outputFormat: "Complete sales playbook, export-ready",
  },
  {
    id: "email-generator",
    action: "generate_email_campaign",
    name: "Email Campaign Generator",
    description: "Create email sequences for nurture, follow-up, and promotion — with variable chips for personalization.",
    category: "messaging",
    emoji: "✉️",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "goal", label: "Campaign goal", placeholder: "e.g. book demos for a SaaS launch targeting mid-size tech companies", required: true },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Generate a 5-email sequence.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
CAMPAIGN GOAL: {{goal}}

For each email produce:
1. Send timing (day offset), subject line + one alternate
2. Body under 120 words with {{first_name}}, {{company}}, {{pain_point}} variable chips
3. One clear CTA
4. The single idea this email must land

Sequence arc: pattern-interrupt -> value -> proof -> objection-kill -> breakup.
Confident, helpful, concise. No buzzwords — verbs and outcomes.`,
    outputFormat: "5-email sequence with variables, ready for your outreach tool",
  },
  {
    id: "call-script-generator",
    action: "generate_phone_scripts",
    name: "Call Script Generator",
    description: "Cold-call, follow-up, and demo-debrief phone scripts for every funnel stage.",
    category: "messaging",
    emoji: "📞",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "scenario", label: "Call scenario", placeholder: "e.g. cold call to a CFO, follow-up after a product demo", required: true },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Write a phone script.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
SCENARIO: {{scenario}}

Produce:
1. Opener (10 seconds, permission-based)
2. The bridge: reason for the call tied to a trigger event
3. 3 discovery questions ordered by information value
4. Value statement under 30 words
5. Objection branches: "not interested", "send me an email", "no budget"
6. Close: specific next step with calendar language

Write it as a talk track someone could read aloud naturally.`,
    outputFormat: "Talk track with objection branches",
  },
  {
    id: "outreach-sequencer",
    action: "create_outreach_sequence",
    name: "Outreach Sequencer",
    description: "Design multi-channel sequences across email, phone, and social with spacing and exit rules.",
    category: "messaging",
    emoji: "🔁",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "channels", label: "Available channels", placeholder: "e.g. email, phone, LinkedIn" },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Design a multi-channel outreach sequence.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
CHANNELS: {{channels}}

Produce a 21-day sequence:
1. Day-by-day touch plan across the channels
2. The message theme per touch (never repeat an angle)
3. Spacing logic and reply-handling branches
4. Exit rules: when to stop, when to recycle to nurture
5. The three metrics that tell you it's working by day 10

Design for a solo operator's reality — sustainable volume, not fantasy volume.`,
    outputFormat: "21-day multi-channel sequence plan",
  },
  {
    id: "messaging-scripts",
    action: "create_messaging_scripts",
    name: "Messaging Script Studio",
    description: "DM and chat scripts for every funnel stage — LinkedIn, Instagram, and community outreach.",
    category: "messaging",
    emoji: "💬",
    inputs: [
      ...COMMON_CONTEXT,
      { id: "channel", label: "Channel", placeholder: "e.g. LinkedIn DM, Instagram, Slack community", required: true },
    ],
    promptTemplate: `Act as the Enably GTM Architect. Write messaging scripts.

PRODUCT: {{product}}
TARGET BUYER: {{audience}}
CHANNEL: {{channel}}

Produce scripts for 4 funnel stages:
1. First touch — under 40 words, curiosity without clickbait
2. Follow-up after engagement (they viewed/liked/replied briefly)
3. Value drop — share something useful with no ask
4. Conversion ask — move to a call without being pushy

Each script native to the channel's tone. No templates that smell like templates.`,
    outputFormat: "4-stage DM script set, channel-native",
  },
]

export const SKILL_CATEGORIES: Record<Skill["category"], { label: string; color: string }> = {
  foundation: { label: "GTM Foundation", color: "#C96442" },
  messaging: { label: "Messaging", color: "#2563EB" },
  playbook: { label: "Playbook", color: "#C96442" },
  research: { label: "Research", color: "#059669" },
}

export function compileSkillPrompt(skill: Skill, values: Record<string, string>): string {
  let prompt = skill.promptTemplate
  for (const input of skill.inputs) {
    const value = values[input.id]?.trim() || "(not specified)"
    prompt = prompt.split(`{{${input.id}}}`).join(value)
  }
  return prompt
}
