"""
Enably GTM Skill Pack — backend registry.

Ported from the Enably GTM Architect manifest (enably-gtm-architect.manifest.json)
and the ENABLY Product Specification. Skills are structured, PAL-ready actions:
typed inputs compile into an execution prompt that runs through the Hermes
runtime (or any registered agent).

The frontend keeps a mirrored catalog in `frontend/lib/skills/enably.ts` for
zero-backend demo mode; this module is the source the runtime executes against.
"""

from __future__ import annotations

from typing import Optional

ENABLY_PACK = {
    "id": "enably-gtm",
    "name": "Enably GTM Architect",
    "version": "0.1.0",
    "mission": (
        "Help founders and revenue teams define, document, and launch a "
        "practical go-to-market system."
    ),
    "framework": {
        "pal": "intent -> composition -> optimization -> runtime",
        "npao_execution_order": ["necessity", "anxiety", "priority", "opportunity"],
        "phases": ["PreD", "D1", "D2", "D3", "D4"],
    },
    "constraints": [
        "Favor operational clarity over jargon.",
        "Do not invent integrations that are not configured.",
        "Tie every recommendation back to the team's stage, offer, and target buyer.",
    ],
}

_SYSTEM = (
    "You are the Enably GTM Architect, a skill of the 6th Agent platform. "
    "Mission: help founders and revenue teams define, document, and launch a "
    "practical go-to-market system. Favor operational clarity over jargon. "
    "Do not invent integrations that are not configured. Tie every "
    "recommendation back to the team's stage, offer, and target buyer."
)

_COMMON_INPUTS = [
    {"id": "product", "label": "Product / offer", "required": True},
    {"id": "audience", "label": "Target buyer", "required": True},
]

ENABLY_SKILLS: list[dict] = [
    {
        "id": "icp-creator",
        "action": "setup_ideal_customer_profile",
        "name": "ICP Creator",
        "description": "Define the ideal customer profile — firmographics, pains, triggers, disqualifiers.",
        "category": "foundation",
        "inputs": _COMMON_INPUTS + [{"id": "stage", "label": "Company stage"}],
        "prompt_template": (
            "Build an Ideal Customer Profile.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "STAGE: {stage}\n\nProduce: firmographics; the buying committee; top 5 ranked pains "
            "with trigger events; 5 must-have qualification criteria and 3 disqualifiers; and "
            "where to find them (channels, communities)."
        ),
    },
    {
        "id": "persona-creator",
        "action": "create_user_personas",
        "name": "User Persona Creator",
        "description": "Turn the ICP into named personas with goals, objections, and message angles.",
        "category": "foundation",
        "inputs": _COMMON_INPUTS + [{"id": "icp", "label": "Existing ICP (optional)"}],
        "prompt_template": (
            "Create 3 user personas.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "ICP CONTEXT: {icp}\n\nFor each: name/title/seniority; goals and success metrics; "
            "daily friction the product removes; top 3 objections with preemptions; and the "
            "one-line message angle that gets a reply. Under 150 words each."
        ),
    },
    {
        "id": "usp-mapper",
        "action": "create_unique_selling_points",
        "name": "USP Mapper",
        "description": "Map USPs against competitors and buyer pains into defensible positioning.",
        "category": "foundation",
        "inputs": _COMMON_INPUTS + [{"id": "competitors", "label": "Competitors / alternatives"}],
        "prompt_template": (
            "Map unique selling points.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "ALTERNATIVES: {competitors}\n\nProduce 5 candidate USPs stated as buyer outcomes, "
            "each with the pain it maps to, proof needed, and competitor gap; a positioning "
            "statement; and the 3 USPs to lead with and why."
        ),
    },
    {
        "id": "use-case-mapper",
        "action": "build_use_case_map",
        "name": "Use Case Mapper",
        "description": "Connect personas to jobs-to-be-done to product capabilities.",
        "category": "foundation",
        "inputs": _COMMON_INPUTS,
        "prompt_template": (
            "Build a use-case map.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n\n"
            "Produce a table of the top 6 use cases: persona and job-to-be-done; current painful "
            "workaround; the capability that does it; honest time/money saved estimate; and the "
            "demo moment that proves it. Order by revenue impact."
        ),
    },
    {
        "id": "market-segmenter",
        "action": "segment_market",
        "name": "Market Segmenter",
        "description": "Segment the market by demographics, behavior, and industry with a beachhead pick.",
        "category": "research",
        "inputs": _COMMON_INPUTS,
        "prompt_template": (
            "Segment the market.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n\n"
            "Produce 4-6 segments with size signal, pain urgency, willingness to pay, ease of "
            "reach; score each 1-10 on fit; recommend the beachhead and next-two sequencing; "
            "state what evidence would change the recommendation. Flag estimates as estimates."
        ),
    },
    {
        "id": "sales-playbook",
        "action": "create_sales_playbook",
        "name": "Sales Playbook Generator",
        "description": "The sales bible — activity targets, SOPs, qualification, cadences, objections.",
        "category": "playbook",
        "inputs": _COMMON_INPUTS + [{"id": "motion", "label": "Sales motion"}],
        "prompt_template": (
            "Write a working sales playbook.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "SALES MOTION: {motion}\n\nProduce weekly activity targets; a qualification framework; "
            "stage-by-stage SOP (prospect -> connect -> discover -> demo -> close); a 21-day "
            "cadence structure; top 5 objections with response frameworks; and the metrics "
            "dashboard. Executable by one person on day one."
        ),
    },
    {
        "id": "email-generator",
        "action": "generate_email_campaign",
        "name": "Email Campaign Generator",
        "description": "Email sequences for nurture, follow-up, and promotion with personalization variables.",
        "category": "messaging",
        "inputs": _COMMON_INPUTS + [{"id": "goal", "label": "Campaign goal", "required": True}],
        "prompt_template": (
            "Generate a 5-email sequence.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "CAMPAIGN GOAL: {goal}\n\nPer email: day offset, subject + alternate, body under 120 "
            "words using {{first_name}}/{{company}}/{{pain_point}} variables, one CTA, and the "
            "single idea it must land. Arc: pattern-interrupt -> value -> proof -> "
            "objection-kill -> breakup."
        ),
    },
    {
        "id": "call-script-generator",
        "action": "generate_phone_scripts",
        "name": "Call Script Generator",
        "description": "Cold-call, follow-up, and demo-debrief phone scripts per funnel stage.",
        "category": "messaging",
        "inputs": _COMMON_INPUTS + [{"id": "scenario", "label": "Call scenario", "required": True}],
        "prompt_template": (
            "Write a phone script.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "SCENARIO: {scenario}\n\nProduce a 10-second permission-based opener; a bridge tied "
            "to a trigger event; 3 discovery questions by information value; a value statement "
            "under 30 words; objection branches (not interested / send an email / no budget); "
            "and a close with calendar language. Natural talk-track style."
        ),
    },
    {
        "id": "outreach-sequencer",
        "action": "create_outreach_sequence",
        "name": "Outreach Sequencer",
        "description": "Multi-channel sequences across email, phone, and social with exit rules.",
        "category": "messaging",
        "inputs": _COMMON_INPUTS + [{"id": "channels", "label": "Available channels"}],
        "prompt_template": (
            "Design a multi-channel outreach sequence.\n\nPRODUCT: {product}\n"
            "TARGET BUYER: {audience}\nCHANNELS: {channels}\n\nProduce a 21-day day-by-day touch "
            "plan; a message theme per touch (never repeat an angle); spacing logic and "
            "reply-handling branches; exit rules; and the 3 metrics that show it works by day 10. "
            "Sized for a solo operator's sustainable volume."
        ),
    },
    {
        "id": "messaging-scripts",
        "action": "create_messaging_scripts",
        "name": "Messaging Script Studio",
        "description": "Channel-native DM and chat scripts for every funnel stage.",
        "category": "messaging",
        "inputs": _COMMON_INPUTS + [{"id": "channel", "label": "Channel", "required": True}],
        "prompt_template": (
            "Write messaging scripts.\n\nPRODUCT: {product}\nTARGET BUYER: {audience}\n"
            "CHANNEL: {channel}\n\nProduce scripts for 4 funnel stages: first touch under 40 "
            "words; follow-up after engagement; value drop with no ask; conversion ask that "
            "moves to a call without being pushy. Native to the channel's tone."
        ),
    },
]


def get_skill(skill_id: str) -> Optional[dict]:
    return next((s for s in ENABLY_SKILLS if s["id"] == skill_id), None)


def compile_skill_prompt(skill: dict, values: dict[str, str]) -> tuple[str, str]:
    """Return (system_prompt, task_prompt) for the Hermes runtime."""

    class _Default(dict):
        def __missing__(self, key):  # unfilled optional inputs
            return "(not specified)"

    safe = _Default({k: (v or "(not specified)") for k, v in values.items()})
    # Preserve literal {{variable}} chips in templates while filling {input} slots.
    template = skill["prompt_template"].replace("{{", "\x00").replace("}}", "\x01")
    task = template.format_map(safe).replace("\x00", "{{").replace("\x01", "}}")
    return _SYSTEM, task
