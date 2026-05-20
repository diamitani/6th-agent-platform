import { NextRequest, NextResponse } from "next/server"
import { CLOUD_PROVIDERS } from "@/lib/cloud"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { provider, name, region, instanceType, agentId } = body

    if (!provider || !name || !region || !instanceType) {
      return NextResponse.json({ error: "provider, name, region, instanceType required" }, { status: 400 })
    }

    const cloudProvider = CLOUD_PROVIDERS.find((c) => c.id === provider)
    if (!cloudProvider) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    // Log the deployment request
    logger.cloud("deploy_request", `Deploying ${name} to ${provider} (${region})`, {
      provider,
      region,
      instanceType,
      agentId,
    })

    // Return the deployment configuration and affiliate link
    return NextResponse.json({
      success: true,
      deployment: {
        provider,
        name,
        region,
        instanceType,
        status: "provisioning",
        affiliateUrl: cloudProvider.affiliateUrl,
        affiliateCode: cloudProvider.affiliateCode,
        docsUrl: cloudProvider.docsUrl,
        estimatedCost: cloudProvider.instances.find((i) => i.instanceType === instanceType)?.pricePerHour || 0,
      },
      message: `Deployment initiated. Follow the setup guide to complete provisioning on ${cloudProvider.name}.`,
    })
  } catch (err) {
    logger.error("deploy_failed", "Cloud deployment failed", String(err))
    return NextResponse.json({ error: "Deployment failed" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ providers: CLOUD_PROVIDERS })
}
