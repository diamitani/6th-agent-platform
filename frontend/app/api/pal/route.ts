import { NextRequest, NextResponse } from "next/server"
import { compileAgentFromNaturalLanguage } from "@/lib/pal"
import { AGENT_TEMPLATES, getTemplateById } from "@/lib/pal/templates"

export async function POST(req: NextRequest) {
  try {
    const { prompt, templateId, context } = await req.json()

    if (!prompt && !templateId) {
      return NextResponse.json({ error: "prompt or templateId required" }, { status: 400 })
    }

    // If a template is specified, use it directly
    if (templateId) {
      const template = getTemplateById(templateId)
      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 })
      }
      return NextResponse.json({
        method: "template",
        manifest: {
          name: template.name,
          role: template.role,
          emoji: template.emoji,
          color: template.color,
          system_prompt: template.systemPrompt,
          triggers: template.triggers,
          domain: template.domain,
          persona_traits: ["professional", "domain-expert"],
          completion_criteria: ["Complete task as specified", "Quality check passed"],
        },
        template: template.id,
      })
    }

    // Run PAL compilation on natural language prompt
    const { manifest, enhanced } = compileAgentFromNaturalLanguage(prompt, context)

    return NextResponse.json({
      method: "pal",
      manifest,
      enhanced: {
        raw: enhanced.raw,
        domain: enhanced.domain,
        constraints: enhanced.constraints,
        urgency: enhanced.urgency,
        ambiguity_score: enhanced.ambiguity_score,
        triggers: enhanced.triggers,
        completion_criteria: enhanced.completion_criteria,
        persona_traits: enhanced.persona_traits,
      },
    })
  } catch (err) {
    console.error("PAL compilation error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PAL compilation failed" },
      { status: 500 }
    )
  }
}
