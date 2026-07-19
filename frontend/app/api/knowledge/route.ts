import { NextRequest, NextResponse } from "next/server"
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { ddb, s3 } from "@/lib/aws/clients"
import { KNOWLEDGE_TABLE, TENANTS_BUCKET } from "@/lib/aws/config"
import { getSession } from "@/lib/aws/session"

// Knowledge base on AWS: document content in the tenant's S3 knowledge-base
// namespace, metadata in DynamoDB. No Supabase.

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, doc_type, content, tags, namespace } = await req.json()
    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 })
    }

    const tenantId = session.tenantId
    const docId = `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const s3Key = `tenants/${tenantId}/knowledge-base/${docId}.md`

    await s3().send(
      new PutObjectCommand({
        Bucket: TENANTS_BUCKET,
        Key: s3Key,
        Body: content,
        ContentType: "text/markdown",
        Metadata: { title: encodeURIComponent(title) },
      })
    )

    const doc = {
      tenant_id: tenantId,
      doc_id: docId,
      id: docId,
      title,
      doc_type: doc_type || "Research",
      content: content.slice(0, 2000), // preview in DynamoDB; full text in S3
      tags: tags || [],
      namespace: namespace || `tenants/${tenantId}`,
      s3_key: s3Key,
      created_at: new Date().toISOString(),
    }
    await ddb().send(new PutCommand({ TableName: KNOWLEDGE_TABLE, Item: doc }))

    return NextResponse.json({ doc })
  } catch (err) {
    console.error("Knowledge API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create doc" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.tenantId) return NextResponse.json({ docs: [] })

    const resp = await ddb().send(
      new QueryCommand({
        TableName: KNOWLEDGE_TABLE,
        KeyConditionExpression: "tenant_id = :t",
        ExpressionAttributeValues: { ":t": session.tenantId },
      })
    )
    const docs = ((resp.Items as any[]) || []).sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
    )
    return NextResponse.json({ docs })
  } catch {
    return NextResponse.json({ docs: [] })
  }
}
