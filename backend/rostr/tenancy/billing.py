"""
Billing meter — credits ledger + usage events on DynamoDB.

Every Bedrock call made on behalf of a tenant records a usage event and
deducts credits (retail = raw cost x markup). BYOK tenants record usage with
zero credit deduction so the dashboard still shows activity.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from loguru import logger

from .pricing import usage_to_credits

TENANTS_TABLE = os.getenv("TENANTS_TABLE", "sixthagent-tenants")
USAGE_TABLE = os.getenv("USAGE_TABLE", "sixthagent-usage")


class BillingMeter:
    def __init__(self, region: Optional[str] = None):
        self.region = region or os.getenv("AWS_REGION", "us-east-1")
        self._ddb = None

    def _table(self, name: str):
        if self._ddb is None:
            import boto3

            self._ddb = boto3.resource("dynamodb", region_name=self.region)
        return self._ddb.Table(name)

    # ---------------------------------------------------------------- reads

    def get_tenant(self, tenant_id: str) -> Optional[dict]:
        resp = self._table(TENANTS_TABLE).get_item(Key={"tenant_id": tenant_id})
        return resp.get("Item")

    def get_balance(self, tenant_id: str) -> int:
        tenant = self.get_tenant(tenant_id)
        return int(tenant.get("credits", 0)) if tenant else 0

    def list_usage(self, tenant_id: str, limit: int = 50) -> list[dict]:
        resp = self._table(USAGE_TABLE).query(
            KeyConditionExpression="tenant_id = :t",
            ExpressionAttributeValues={":t": tenant_id},
            ScanIndexForward=False,
            Limit=limit,
        )
        return resp.get("Items", [])

    # --------------------------------------------------------------- writes

    def add_credits(self, tenant_id: str, credits: int) -> int:
        resp = self._table(TENANTS_TABLE).update_item(
            Key={"tenant_id": tenant_id},
            UpdateExpression="ADD credits :c",
            ExpressionAttributeValues={":c": Decimal(credits)},
            ReturnValues="UPDATED_NEW",
        )
        return int(resp["Attributes"]["credits"])

    def record_usage(
        self,
        tenant_id: str,
        agent_id: str,
        model_id: str,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        billing_mode: str = "credits",
        run_id: str = "",
    ) -> dict:
        credits = usage_to_credits(cost_usd) if billing_mode == "credits" else 0
        ts = datetime.now(timezone.utc).isoformat()
        event = {
            "tenant_id": tenant_id,
            "ts": ts,
            "agent_id": agent_id,
            "run_id": run_id,
            "model_id": model_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": Decimal(str(round(cost_usd, 6))),
            "credits_deducted": credits,
            "billing_mode": billing_mode,
        }
        try:
            self._table(USAGE_TABLE).put_item(Item=event)
            balance = None
            if credits:
                resp = self._table(TENANTS_TABLE).update_item(
                    Key={"tenant_id": tenant_id},
                    UpdateExpression="ADD credits :c",
                    ExpressionAttributeValues={":c": Decimal(-credits)},
                    ReturnValues="UPDATED_NEW",
                )
                balance = int(resp["Attributes"]["credits"])
            return {"credits_deducted": credits, "balance": balance, "ts": ts}
        except Exception as e:
            logger.warning(f"Usage metering failed for {tenant_id}: {e}")
            return {"credits_deducted": 0, "balance": None, "error": str(e)}
