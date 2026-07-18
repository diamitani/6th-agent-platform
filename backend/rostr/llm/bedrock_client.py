"""
AWS Bedrock client — the platform "credits" model provider.

Tenants either bring their own key (BYOK) or spend platform credits, which
are metered against Bedrock usage on the platform AWS account. Every call
returns token usage and computed cost so the billing layer can deduct
credits with full transparency.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

from loguru import logger

DEFAULT_MODEL = os.getenv(
    "BEDROCK_MODEL", "us.anthropic.claude-haiku-4-5-20251001-v1:0"
)

# USD per 1M tokens (input, output). Keyed by substring match on model id.
BEDROCK_PRICING: dict[str, tuple[float, float]] = {
    "claude-haiku-4-5": (1.00, 5.00),
    "claude-sonnet-4": (3.00, 15.00),
    "claude-opus-4": (15.00, 75.00),
    "nova-micro": (0.035, 0.14),
    "nova-lite": (0.06, 0.24),
    "nova-pro": (0.80, 3.20),
    "llama3-3-70b": (0.72, 0.72),
}
_FALLBACK_PRICING = (3.00, 15.00)  # assume sonnet-class when unknown


def model_pricing(model_id: str) -> tuple[float, float]:
    for key, price in BEDROCK_PRICING.items():
        if key in model_id:
            return price
    return _FALLBACK_PRICING


@dataclass
class BedrockCompletion:
    text: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    model_id: str


class BedrockClient:
    """Thin wrapper over the Bedrock Converse API with cost accounting."""

    def __init__(self, region: Optional[str] = None, model_id: Optional[str] = None):
        self.region = region or os.getenv("AWS_REGION", "us-east-1")
        self.model_id = model_id or DEFAULT_MODEL
        self._client = None

    @property
    def enabled(self) -> bool:
        return bool(
            os.getenv("AWS_ACCESS_KEY_ID")
            or os.getenv("AWS_PROFILE")
            or os.getenv("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI")
            or os.getenv("AWS_BEARER_TOKEN_BEDROCK")
        )

    def _runtime(self):
        if self._client is None:
            import boto3

            self._client = boto3.client("bedrock-runtime", region_name=self.region)
        return self._client

    def converse(
        self,
        system: str,
        messages: list[dict],
        model_id: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.4,
    ) -> BedrockCompletion:
        """Synchronous Bedrock Converse call (run in a thread from async code)."""
        model = model_id or self.model_id
        bedrock_messages = [
            {"role": m["role"], "content": [{"text": m["content"]}]} for m in messages
        ]
        resp = self._runtime().converse(
            modelId=model,
            system=[{"text": system}] if system else [],
            messages=bedrock_messages,
            inferenceConfig={"maxTokens": max_tokens, "temperature": temperature},
        )
        usage = resp.get("usage", {})
        in_tok = int(usage.get("inputTokens", 0))
        out_tok = int(usage.get("outputTokens", 0))
        price_in, price_out = model_pricing(model)
        cost = (in_tok * price_in + out_tok * price_out) / 1_000_000
        text = "".join(
            block.get("text", "")
            for block in resp["output"]["message"]["content"]
            if "text" in block
        )
        logger.debug(f"Bedrock {model}: {in_tok}in/{out_tok}out ${cost:.6f}")
        return BedrockCompletion(
            text=text,
            input_tokens=in_tok,
            output_tokens=out_tok,
            cost_usd=round(cost, 6),
            model_id=model,
        )
