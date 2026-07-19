// AWS-only backend configuration. No Supabase — Cognito auth, DynamoDB data,
// S3 knowledge, Bedrock models.

export const AWS_REGION = process.env.APP_AWS_REGION || process.env.AWS_REGION || "us-east-1"

export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "us-east-1_lFt9clRcP"
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || "3nppjvqoqd260ekmf6dugtvl0j"

export const TENANTS_TABLE = process.env.TENANTS_TABLE || "sixthagent-tenants"
export const USAGE_TABLE = process.env.USAGE_TABLE || "sixthagent-usage"
export const AGENTS_TABLE = process.env.AGENTS_TABLE || "sixthagent-agents"
export const KNOWLEDGE_TABLE = process.env.KNOWLEDGE_TABLE || "sixthagent-knowledge"

export const TENANTS_BUCKET = process.env.TENANTS_BUCKET || "sixthagent-tenants-148761663702"

export const BEDROCK_MODEL =
  process.env.BEDROCK_MODEL || "us.anthropic.claude-haiku-4-5-20251001-v1:0"

export const SESSION_COOKIE = "sixthagent_session"

// USD per 1M tokens (input, output) — keep in sync with backend pricing.py
export const BEDROCK_PRICING: Record<string, [number, number]> = {
  "claude-haiku-4-5": [1.0, 5.0],
  "claude-sonnet-4": [3.0, 15.0],
  "claude-opus-4": [15.0, 75.0],
  "nova-lite": [0.06, 0.24],
  "nova-pro": [0.8, 3.2],
}

export function modelPricing(modelId: string): [number, number] {
  for (const [key, price] of Object.entries(BEDROCK_PRICING)) {
    if (modelId.includes(key)) return price
  }
  return [3.0, 15.0]
}

export const CREDIT_USD = 0.01
export const CREDIT_MARKUP = 1.5

export function usageToCredits(costUsd: number): number {
  return Math.max(1, Math.ceil((costUsd * CREDIT_MARKUP) / CREDIT_USD))
}
