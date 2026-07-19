import { NextRequest, NextResponse } from "next/server"
import { ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime"
import { bedrock } from "@/lib/aws/clients"
import { BEDROCK_MODEL, modelPricing } from "@/lib/aws/config"
import { getSession } from "@/lib/aws/session"
import { recordUsage } from "@/lib/aws/tenant"

export const maxDuration = 60

// AWS Bedrock chat — the platform "credits" provider. Streams tokens and
// meters usage (tokens + cost -> credits) against the caller's tenant.

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const { messages, systemPrompt, agentId } = await req.json()
    if (!messages?.length) {
      return NextResponse.json({ error: "messages are required" }, { status: 400 })
    }

    const command = new ConverseStreamCommand({
      modelId: BEDROCK_MODEL,
      system: systemPrompt ? [{ text: systemPrompt }] : undefined,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: [{ text: m.content }],
      })),
      inferenceConfig: { maxTokens: 4096, temperature: 0.6 },
    })

    const response = await bedrock().send(command)
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let inputTokens = 0
        let outputTokens = 0
        try {
          for await (const event of response.stream!) {
            const delta = event.contentBlockDelta?.delta?.text
            if (delta) controller.enqueue(encoder.encode(delta))
            if (event.metadata?.usage) {
              inputTokens = event.metadata.usage.inputTokens || 0
              outputTokens = event.metadata.usage.outputTokens || 0
            }
          }
        } finally {
          // Meter BEFORE closing the stream — Vercel freezes the function the
          // moment the response ends, so an un-awaited write would be lost.
          if (session?.tenantId && (inputTokens || outputTokens)) {
            const [inPrice, outPrice] = modelPricing(BEDROCK_MODEL)
            const costUsd = (inputTokens * inPrice + outputTokens * outPrice) / 1_000_000
            try {
              await recordUsage({
                tenantId: session.tenantId,
                agentId: agentId || "chat",
                modelId: BEDROCK_MODEL,
                inputTokens,
                outputTokens,
                costUsd,
              })
            } catch (e) {
              console.error("Metering failed:", e)
            }
          }
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Provider": "bedrock",
        "X-Model": BEDROCK_MODEL,
      },
    })
  } catch (err) {
    console.error("Bedrock chat error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bedrock chat failed" },
      { status: 500 }
    )
  }
}
