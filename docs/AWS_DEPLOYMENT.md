# AWS Backend Deployment — 6th Agent Platform

The production backend runs on AWS with S3 as the Reference Hub knowledge store,
per-tenant company instances on S3 + DynamoDB, and AWS Bedrock as the platform
"credits" model provider. This document describes the live topology and the
environment variables the code understands.

## Tenant Instances (live)

`POST /api/instances/provision` runs the whole signup pipeline in one call:

```
sign up ──► PAL questionnaire ──► org profile docs (identity/icp/positioning)
        ──► ROSTR script package (master build instructions + agent manifests)
        ──► AWS instance: s3://{TENANTS_BUCKET}/tenants/{tenant_id}/
             ├── knowledge-base/   RAG DAL outputs + curated docs
             ├── uploads/          user-uploaded files
             ├── agents/           compiled agent manifests
             ├── playbooks/        prompts, cadences, scripts
             ├── rag/              vector-store exports
             └── runs/             Hermes runtime traces
        ──► DynamoDB tenant record ({TENANTS_TABLE}) + credit grant
        ──► cost sheet (raw AWS cost, retail credits, suggested price)
```

A tenant instance is a namespaced slice of shared serverless infrastructure
(S3 prefix + DynamoDB rows) — cents per month at rest, which is what makes the
credit model profitable. Dedicated compute is the Agency-tier upgrade path.

## Billing: credits vs BYOK

| Mode | Model calls | Metering |
|---|---|---|
| **credits** | Platform Bedrock key (`BEDROCK_MODEL`, default Claude Haiku 4.5) | Every call records tokens + raw cost to `{USAGE_TABLE}`; credits deducted at retail = raw x 1.5 markup; 1 credit = $0.01 |
| **byok** | Tenant's own Anthropic/OpenAI key | Usage recorded with zero deduction; platform fee only |

Admin credit assignment: `POST /api/instances/{tenant_id}/credits`.
Cost calculator: `POST /api/instances/estimate` (tasks/month + storage in,
raw AWS cost + credits needed + suggested price out).

## Reference Topology

```
                        ┌──────────────────────────────┐
   Vercel (frontend)    │            AWS               │
   Next.js 15 ──────────▶  ALB ──► ECS Fargate service │
                        │           (FastAPI backend)  │
                        │               │              │
                        │   ┌───────────┼───────────┐  │
                        │   ▼           ▼           ▼  │
                        │  S3        RDS Postgres  ElastiCache
                        │  (Reference (pgvector)   (Redis bus)
                        │   Hub KB)                    │
                        └──────────────────────────────┘
                                        │
                     Composio API (tools) · Anthropic / Ollama (models)
```

| Concern | Service | Notes |
|---|---|---|
| API runtime | ECS Fargate (or a single EC2 instance to start) | Container from `backend/`, port 8000 |
| Knowledge base | **S3** | One bucket, ROSTR namespaces as key prefixes (`projects/`, `orgs/`, `teams/`, `global/`) |
| Database | RDS PostgreSQL 16 + pgvector | Supabase-managed Postgres also works |
| Message bus / cache | ElastiCache Redis | Optional at small scale |
| Secrets | AWS Secrets Manager / SSM Parameter Store | Inject as env vars into the task definition |

## Environment Variables

```bash
# Knowledge base (S3)
ROSTR_KB_BUCKET=rostr-hub-kb          # enables the S3 Reference Hub
AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY — or (preferred) an IAM task role
# S3_ENDPOINT_URL=http://minio:9000   # local dev with MinIO

# Tenant instances + credits billing
TENANTS_BUCKET=sixthagent-tenants-<account-id>
TENANTS_TABLE=sixthagent-tenants
USAGE_TABLE=sixthagent-usage
BEDROCK_MODEL=us.anthropic.claude-haiku-4-5-20251001-v1:0

# Tool integrations
COMPOSIO_API_KEY=ak_...               # live Composio arsenal (300+ apps)

# Hermes runtime (first configured provider wins)
ANTHROPIC_API_KEY=sk-ant-...          # Claude (Claude Code-grade loop)
ANTHROPIC_MODEL=claude-sonnet-4-5
HERMES_MODEL=hermes3:8b               # open-source fallback via Ollama
OLLAMA_HOST=http://localhost:11434

# API
ALLOWED_ORIGINS=https://app.yourdomain.com
```

## Minimal IAM Policy (task role)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::rostr-hub-kb",
        "arn:aws:s3:::rostr-hub-kb/*"
      ]
    }
  ]
}
```

## Bootstrap (one-time)

```bash
aws s3 mb s3://rostr-hub-kb --region us-east-1
aws s3api put-bucket-encryption --bucket rostr-hub-kb \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-public-access-block --bucket rostr-hub-kb \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

The backend picks the bucket up automatically at boot:

```
📚 Knowledge store: s3://rostr-hub-kb
```

## Local Development

`docker-compose.yml` ships MinIO — point the store at it:

```bash
ROSTR_KB_BUCKET=rostr-hub-kb
S3_ENDPOINT_URL=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

## API Surface Backed by This Setup

| Endpoint | Purpose |
|---|---|
| `POST /api/files/upload` | Upload a document into a hub namespace |
| `GET /api/files/list` | List documents in a namespace |
| `GET /api/files/presign` / `POST /api/files/presign-upload` | Direct-to-S3 transfer URLs |
| `GET /api/integrations/toolkits` | Composio toolkit catalog (live with API key) |
| `POST /api/integrations/connect` | Start an OAuth connection for a workspace user |
| `POST /api/runtime/run` | Execute an agent through the Hermes runtime |
| `GET /api/tasks/canvas` | NPAO Canvas — four columns in N→A→P→O order |
