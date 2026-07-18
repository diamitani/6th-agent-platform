# AWS Backend Deployment — 6th Agent Platform

The production backend runs on AWS with S3 as the Reference Hub knowledge store.
This document describes the reference topology and the environment variables the
code already understands.

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
