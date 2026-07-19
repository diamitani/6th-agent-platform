"""
Tenant Provisioner — one-stop company instance setup on AWS.

Flow (the product's signup pipeline):

    1. SIGN UP        company + owner identity
    2. QUESTIONNAIRE  PAL onboarding intake (identity, ICP, goal, channels)
    3. PAL COMPILE    intake -> org profile docs (identity/icp/positioning)
    4. ROSTR PACKAGE  master build instructions + starter agent manifests
                      + Enably GTM skill pack, all as versioned artifacts
    5. AWS INSTANCE   S3 namespace (knowledge-base, agents, playbooks, rag,
                      uploads) + DynamoDB tenant record + credit grant
    6. COST SHEET     estimated monthly economics for the chosen plan

Design note: a "tenant instance" is a namespaced slice of shared
infrastructure (S3 prefix + DynamoDB rows), not a dedicated EC2 box —
serverless per-tenant cost is cents/month at rest, which is what makes the
credit model profitable. Dedicated compute remains a future Agency-tier
upgrade path.

Billing modes:
    credits — platform Bedrock key, usage metered, credits deducted
    byok    — tenant's own key (Anthropic/OpenAI/Bedrock), platform fee only
"""

from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from loguru import logger

from .pricing import PLAN_CATALOG, estimate_monthly_cost

TENANTS_TABLE = os.getenv("TENANTS_TABLE", "sixthagent-tenants")
TENANTS_BUCKET = os.getenv(
    "TENANTS_BUCKET", "sixthagent-tenants-148761663702"
)

S3_LAYOUT = [
    "knowledge-base/",   # RAG DAL outputs + curated docs
    "uploads/",          # raw user-uploaded files
    "agents/",           # compiled agent manifests
    "playbooks/",        # ROSTR script packages (prompts, cadences, scripts)
    "rag/",              # vector-store exports / chunk cache
    "runs/",             # Hermes runtime traces
]

# Starter agents chosen from the questionnaire's primary goal
GOAL_AGENT_MAP: dict[str, list[dict]] = {
    "sales": [
        {"id": "sales-hunter", "name": "Sales Hunter", "emoji": "🏹", "role": "Outbound prospecting and follow-up", "skills": ["outreach-sequencer", "call-script-generator", "email-generator"]},
        {"id": "pipeline-keeper", "name": "Pipeline Keeper", "emoji": "📈", "role": "CRM hygiene and deal follow-through", "skills": ["sales-playbook"]},
    ],
    "marketing": [
        {"id": "content-engine", "name": "Content Engine", "emoji": "✍️", "role": "Content, social, and campaign copy", "skills": ["email-generator", "messaging-scripts"]},
        {"id": "market-scout", "name": "Market Scout", "emoji": "🔭", "role": "Competitive and audience research", "skills": ["market-segmenter", "icp-creator"]},
    ],
    "operations": [
        {"id": "chief-of-staff", "name": "Chief of Staff", "emoji": "🎖️", "role": "Triage, status, and NPAO priorities", "skills": ["use-case-mapper"]},
        {"id": "ops-runner", "name": "Ops Runner", "emoji": "⚙️", "role": "Process automation and reporting", "skills": ["sales-playbook"]},
    ],
    "product": [
        {"id": "product-strategist", "name": "Product Strategist", "emoji": "🧭", "role": "Positioning, roadmap, user insight", "skills": ["usp-mapper", "use-case-mapper", "persona-creator"]},
    ],
}
DEFAULT_AGENTS = GOAL_AGENT_MAP["sales"]


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "company"


class TenantProvisioner:
    def __init__(self, region: Optional[str] = None, knowledge_store=None):
        self.region = region or os.getenv("AWS_REGION", "us-east-1")
        self.bucket = TENANTS_BUCKET
        self._s3 = None
        self._ddb = None

    @property
    def enabled(self) -> bool:
        return bool(os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE"))

    def _s3_client(self):
        if self._s3 is None:
            import boto3

            self._s3 = boto3.client("s3", region_name=self.region)
        return self._s3

    def _tenants_table(self):
        if self._ddb is None:
            import boto3

            self._ddb = boto3.resource("dynamodb", region_name=self.region)
        return self._ddb.Table(TENANTS_TABLE)

    # ------------------------------------------------------------ PAL stage

    @staticmethod
    def compile_org_profile(questionnaire: dict) -> dict[str, str]:
        """PAL Stage: compile the onboarding intake into org profile docs."""
        company = questionnaire.get("company", "Your Company")
        identity = questionnaire.get("identity", "")
        icp = questionnaire.get("icp", "")
        goal = questionnaire.get("goal", "sales")
        offer = questionnaire.get("offer", "")
        channels = questionnaire.get("channels", "email, LinkedIn")
        stage = questionnaire.get("stage", "early")

        identity_md = f"""# {company} — Identity

## Who we are
{identity or "(fill in during onboarding)"}

## Offer
{offer or "(fill in during onboarding)"}

## Stage
{stage}

## Primary goal
{goal}
"""
        icp_md = f"""# {company} — Ideal Customer Profile

## Target buyer
{icp or "(fill in during onboarding)"}

## Primary channels
{channels}

## Notes
Compiled by PAL from the onboarding questionnaire. Refine with the
ICP Creator skill (Enably GTM pack) for the full firmographic breakdown.
"""
        positioning_md = f"""# {company} — Positioning

For {icp or "[target buyer]"} pursuing {goal},
{company} delivers {offer or "[offer]"}.

Voice: confident, helpful, concise. Verbs and outcomes over buzzwords.
"""
        return {
            "identity.md": identity_md,
            "icp.md": icp_md,
            "positioning.md": positioning_md,
        }

    # ---------------------------------------------------------- ROSTR stage

    @staticmethod
    def build_script_package(questionnaire: dict, agents: list[dict]) -> dict:
        """ROSTR Stage: master build instructions + per-agent manifests."""
        company = questionnaire.get("company", "Your Company")
        goal = questionnaire.get("goal", "sales")

        master = {
            "id": "master-build-instructions",
            "framework": {
                "pal": "intent -> composition -> optimization -> runtime",
                "npao_execution_order": ["necessity", "anxiety", "priority", "opportunity"],
                "phases": ["PreD", "D1", "D2", "D3", "D4"],
            },
            "mission": f"Operate {company}'s {goal} function as a coordinated agent team.",
            "operating_rules": [
                "Run PAL before execution. Never act on raw intent.",
                "Classify every task NPAO; execute N -> A -> P -> O.",
                "Write learnings and decisions back to the Reference Hub.",
                "Escalate to the operator on irreversible or external-facing actions.",
            ],
            "reference_hub": {
                "read": ["identity.md", "icp.md", "positioning.md", "knowledge-base/"],
                "write": ["runs/", "knowledge-base/learnings/"],
            },
        }

        manifests = []
        for agent in agents:
            manifests.append(
                {
                    "id": agent["id"],
                    "name": agent["name"],
                    "emoji": agent["emoji"],
                    "role": agent["role"],
                    "model": "bedrock:claude-haiku-4-5 (credits) | byok",
                    "skills": agent["skills"],
                    "system_prompt": (
                        f"You are {agent['name']}, {agent['role']} for {company}. "
                        f"Mission: advance the company's {goal} goal. "
                        "Load org context from identity.md, icp.md, and positioning.md "
                        "before acting. Classify tasks NPAO and execute in "
                        "N->A->P->O order. Favor operational clarity over jargon. "
                        "Write results back to the Reference Hub."
                    ),
                    "memory": {"mode": "project", "namespace": "tenant"},
                }
            )
        return {"master": master, "agents": manifests}

    # ------------------------------------------------------------ AWS stage

    def provision(
        self,
        company: str,
        owner_email: str,
        questionnaire: dict,
        plan: str = "free",
        billing_mode: str = "credits",
        byok: Optional[dict] = None,
    ) -> dict:
        """Create the complete company instance. Returns the instance summary."""
        if plan not in PLAN_CATALOG:
            raise ValueError(f"Unknown plan '{plan}' — one of {list(PLAN_CATALOG)}")
        if billing_mode not in ("credits", "byok"):
            raise ValueError("billing_mode must be 'credits' or 'byok'")

        plan_info = PLAN_CATALOG[plan]
        tenant_id = f"{_slugify(company)}-{uuid.uuid4().hex[:8]}"
        prefix = f"tenants/{tenant_id}/"
        questionnaire = {"company": company, **questionnaire}

        # PAL + ROSTR stages (deterministic — provisioning is instant and free)
        profile_docs = self.compile_org_profile(questionnaire)
        agents = GOAL_AGENT_MAP.get(questionnaire.get("goal", "sales"), DEFAULT_AGENTS)
        package = self.build_script_package(questionnaire, agents)

        # S3 namespace layout
        s3 = self._s3_client()
        for folder in S3_LAYOUT:
            s3.put_object(Bucket=self.bucket, Key=f"{prefix}{folder}")
        for filename, content in profile_docs.items():
            s3.put_object(
                Bucket=self.bucket,
                Key=f"{prefix}{filename}",
                Body=content.encode("utf-8"),
                ContentType="text/markdown",
            )
        s3.put_object(
            Bucket=self.bucket,
            Key=f"{prefix}playbooks/master-build-instructions.json",
            Body=json.dumps(package["master"], indent=2).encode("utf-8"),
            ContentType="application/json",
        )
        for manifest in package["agents"]:
            s3.put_object(
                Bucket=self.bucket,
                Key=f"{prefix}agents/{manifest['id']}.manifest.json",
                Body=json.dumps(manifest, indent=2).encode("utf-8"),
                ContentType="application/json",
            )

        # DynamoDB tenant record with the plan's credit grant
        created_at = datetime.now(timezone.utc).isoformat()
        record = {
            "tenant_id": tenant_id,
            "company": company,
            "owner_email": owner_email,
            "plan": plan,
            "billing_mode": billing_mode,
            "credits": Decimal(plan_info["included_credits"] if billing_mode == "credits" else 0),
            "byok_providers": list((byok or {}).keys()),
            "s3_bucket": self.bucket,
            "s3_prefix": prefix,
            "agents": [a["id"] for a in package["agents"]],
            "status": "active",
            "created_at": created_at,
        }
        self._tenants_table().put_item(Item=record)

        cost = estimate_monthly_cost(
            tasks_per_month=plan_info["tasks_month_estimate"],
            kb_storage_gb=plan_info["kb_storage_gb"],
            byok=(billing_mode == "byok"),
        )

        logger.info(f"🏢 Provisioned tenant {tenant_id} ({plan}, {billing_mode})")
        return {
            "tenant_id": tenant_id,
            "company": company,
            "plan": plan_info["name"],
            "billing_mode": billing_mode,
            "credits": int(record["credits"]),
            "instance": {
                "s3": f"s3://{self.bucket}/{prefix}",
                "namespaces": S3_LAYOUT,
                "dynamodb_table": TENANTS_TABLE,
                "region": self.region,
            },
            "agents": package["agents"],
            "profile_docs": list(profile_docs.keys()),
            "cost_estimate": cost,
            "created_at": created_at,
        }

    # ----------------------------------------------------------------- read

    def get_instance(self, tenant_id: str) -> Optional[dict]:
        resp = self._tenants_table().get_item(Key={"tenant_id": tenant_id})
        item = resp.get("Item")
        if not item:
            return None
        item["credits"] = int(item.get("credits", 0))
        return item

    def list_instances(self, limit: int = 50) -> list[dict]:
        resp = self._tenants_table().scan(Limit=limit)
        items = resp.get("Items", [])
        for i in items:
            i["credits"] = int(i.get("credits", 0))
        return items
