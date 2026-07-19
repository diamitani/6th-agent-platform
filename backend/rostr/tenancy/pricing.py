"""
Cost model for tenant instances.

Two billing modes:
  BYOK    — tenant brings their own model key; we charge platform fee only.
  CREDITS — tenant spends platform credits metered against AWS Bedrock usage
            on the platform account. 1 credit = $0.01 of retail model spend.

Retail model spend = raw Bedrock cost x CREDIT_MARKUP, so infrastructure and
margin are covered transparently. The estimator below prices the full AWS
footprint per tenant so plans can be set with known unit economics.
"""

from __future__ import annotations

# ---------------------------------------------------------------- constants

CREDIT_USD = 0.01          # retail value of one credit
CREDIT_MARKUP = 1.5        # retail = raw Bedrock cost x markup

# AWS unit costs (us-east-1, on-demand)
S3_GB_MONTH = 0.023
S3_PUT_PER_1K = 0.005
DDB_WRITE_PER_M = 1.25
DDB_READ_PER_M = 0.25
DDB_GB_MONTH = 0.25

# Average tokens for one agent task through the Hermes loop
AVG_INPUT_TOKENS_PER_TASK = 3_000
AVG_OUTPUT_TOKENS_PER_TASK = 1_200


# ------------------------------------------------------------------- plans

PLAN_CATALOG: dict[str, dict] = {
    "free": {
        "name": "Free",
        "price_usd_month": 0,
        "agents": 3,
        "included_credits": 100,        # ~$1.00 retail model spend
        "kb_storage_gb": 1,
        "tasks_month_estimate": 50,
        "mode": "credits",
    },
    "core": {
        "name": "Core",
        "price_usd_month": 29,
        "agents": 10,
        "included_credits": 1_200,      # ~$12 retail model spend
        "kb_storage_gb": 10,
        "tasks_month_estimate": 600,
        "mode": "credits-or-byok",
    },
    "pro": {
        "name": "Pro",
        "price_usd_month": 99,
        "agents": -1,                   # unlimited
        "included_credits": 5_000,      # ~$50 retail model spend
        "kb_storage_gb": 50,
        "tasks_month_estimate": 2_500,
        "mode": "credits-or-byok",
    },
    "agency": {
        "name": "Agency",
        "price_usd_month": 299,
        "agents": -1,
        "included_credits": 18_000,     # ~$180 retail model spend
        "kb_storage_gb": 250,
        "tasks_month_estimate": 9_000,
        "mode": "credits-or-byok",
    },
}


# --------------------------------------------------------------- estimator

def estimate_monthly_cost(
    tasks_per_month: int,
    kb_storage_gb: float = 5.0,
    model_price_in_per_m: float = 1.00,   # claude-haiku-4-5 class
    model_price_out_per_m: float = 5.00,
    byok: bool = False,
) -> dict:
    """Estimate the raw AWS cost of one tenant instance for a month."""
    model_cost = 0.0
    if not byok:
        model_cost = tasks_per_month * (
            AVG_INPUT_TOKENS_PER_TASK * model_price_in_per_m
            + AVG_OUTPUT_TOKENS_PER_TASK * model_price_out_per_m
        ) / 1_000_000

    s3_cost = kb_storage_gb * S3_GB_MONTH + (tasks_per_month / 1000) * S3_PUT_PER_1K
    # ~6 DynamoDB writes + 20 reads per task (state, usage, timeline)
    ddb_cost = (
        tasks_per_month * 6 / 1_000_000 * DDB_WRITE_PER_M * 1_000
        + tasks_per_month * 20 / 1_000_000 * DDB_READ_PER_M * 1_000
    ) / 1_000 + 0.5 * DDB_GB_MONTH

    raw_total = model_cost + s3_cost + ddb_cost
    retail_model = model_cost * CREDIT_MARKUP
    credits_needed = int(round(retail_model / CREDIT_USD)) if not byok else 0

    return {
        "assumptions": {
            "tasks_per_month": tasks_per_month,
            "kb_storage_gb": kb_storage_gb,
            "avg_tokens_per_task": {
                "input": AVG_INPUT_TOKENS_PER_TASK,
                "output": AVG_OUTPUT_TOKENS_PER_TASK,
            },
            "byok": byok,
        },
        "raw_cost_usd": {
            "bedrock_model": round(model_cost, 2),
            "s3_knowledge_base": round(s3_cost, 2),
            "dynamodb_state": round(ddb_cost, 2),
            "total": round(raw_total, 2),
        },
        "retail": {
            "credit_markup": CREDIT_MARKUP,
            "credit_usd": CREDIT_USD,
            "credits_needed": credits_needed,
            "model_spend_retail_usd": round(retail_model, 2),
        },
        "suggested_price_usd": round(max(raw_total * 3, 9), 0),
    }


def usage_to_credits(cost_usd: float) -> int:
    """Convert raw Bedrock spend into credits to deduct (retail, rounded up)."""
    retail = cost_usd * CREDIT_MARKUP
    return max(1, int(-(-retail // CREDIT_USD)))  # ceil
