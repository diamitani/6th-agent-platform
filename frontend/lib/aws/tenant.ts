// Tenant provisioning + data access on AWS (S3 + DynamoDB).
// TypeScript mirror of backend/rostr/tenancy/provisioner.py for the
// Vercel-only deployment path.

import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { ddb, s3 } from "./clients"
import { AGENTS_TABLE, TENANTS_BUCKET, TENANTS_TABLE, USAGE_TABLE, usageToCredits } from "./config"

const S3_LAYOUT = ["knowledge-base/", "uploads/", "agents/", "playbooks/", "rag/", "runs/"]

export interface TenantRecord {
  tenant_id: string
  company: string
  owner_email: string
  plan: string
  billing_mode: string
  credits: number
  s3_bucket: string
  s3_prefix: string
  status: string
  created_at: string
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "company"
}

export async function provisionTenant(opts: {
  company: string
  ownerEmail: string
  plan?: string
  credits?: number
}): Promise<TenantRecord> {
  const tenantId = `${slugify(opts.company)}-${Math.random().toString(36).slice(2, 10)}`
  const prefix = `tenants/${tenantId}/`

  await Promise.all(
    S3_LAYOUT.map((folder) =>
      s3().send(new PutObjectCommand({ Bucket: TENANTS_BUCKET, Key: `${prefix}${folder}` }))
    )
  )

  const record: TenantRecord = {
    tenant_id: tenantId,
    company: opts.company,
    owner_email: opts.ownerEmail,
    plan: opts.plan || "free",
    billing_mode: "credits",
    credits: opts.credits ?? 100,
    s3_bucket: TENANTS_BUCKET,
    s3_prefix: prefix,
    status: "active",
    created_at: new Date().toISOString(),
  }
  await ddb().send(new PutCommand({ TableName: TENANTS_TABLE, Item: record }))
  return record
}

export async function getTenant(tenantId: string): Promise<TenantRecord | null> {
  const resp = await ddb().send(
    new GetCommand({ TableName: TENANTS_TABLE, Key: { tenant_id: tenantId } })
  )
  return (resp.Item as TenantRecord) || null
}

export async function writeTenantDoc(
  tenantId: string,
  filename: string,
  content: string,
  contentType = "text/markdown"
) {
  await s3().send(
    new PutObjectCommand({
      Bucket: TENANTS_BUCKET,
      Key: `tenants/${tenantId}/${filename}`,
      Body: content,
      ContentType: contentType,
    })
  )
}

// ------------------------------------------------------------------ agents

export interface AgentRecord {
  tenant_id: string
  agent_id: string
  name: string
  role: string
  emoji: string
  color: string
  description?: string
  system_prompt?: string
  triggers?: string[]
  tools?: string[]
  is_active: boolean
  created_at: string
}

export async function listAgents(tenantId: string): Promise<AgentRecord[]> {
  const resp = await ddb().send(
    new QueryCommand({
      TableName: AGENTS_TABLE,
      KeyConditionExpression: "tenant_id = :t",
      ExpressionAttributeValues: { ":t": tenantId },
    })
  )
  return ((resp.Items as AgentRecord[]) || []).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )
}

export async function getAgent(tenantId: string, agentId: string): Promise<AgentRecord | null> {
  const resp = await ddb().send(
    new GetCommand({ TableName: AGENTS_TABLE, Key: { tenant_id: tenantId, agent_id: agentId } })
  )
  return (resp.Item as AgentRecord) || null
}

export async function createAgent(
  tenantId: string,
  agent: Omit<AgentRecord, "tenant_id" | "agent_id" | "is_active" | "created_at">
): Promise<AgentRecord> {
  const record: AgentRecord = {
    tenant_id: tenantId,
    agent_id: `agent-${Math.random().toString(36).slice(2, 12)}`,
    is_active: true,
    created_at: new Date().toISOString(),
    ...agent,
  }
  await ddb().send(new PutCommand({ TableName: AGENTS_TABLE, Item: record }))
  return record
}

// ------------------------------------------------------------------- usage

export async function recordUsage(opts: {
  tenantId: string
  agentId: string
  modelId: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  billingMode?: string
}) {
  const credits = (opts.billingMode ?? "credits") === "credits" ? usageToCredits(opts.costUsd) : 0
  await ddb().send(
    new PutCommand({
      TableName: USAGE_TABLE,
      Item: {
        tenant_id: opts.tenantId,
        ts: new Date().toISOString(),
        agent_id: opts.agentId,
        model_id: opts.modelId,
        input_tokens: opts.inputTokens,
        output_tokens: opts.outputTokens,
        cost_usd: Math.round(opts.costUsd * 1e6) / 1e6,
        credits_deducted: credits,
        billing_mode: opts.billingMode ?? "credits",
      },
    })
  )
  if (credits > 0) {
    await ddb().send(
      new UpdateCommand({
        TableName: TENANTS_TABLE,
        Key: { tenant_id: opts.tenantId },
        UpdateExpression: "ADD credits :c",
        ExpressionAttributeValues: { ":c": -credits },
      })
    )
  }
  return credits
}
