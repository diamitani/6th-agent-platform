import { NextRequest, NextResponse } from "next/server"
import { TEMPLATE_CATALOG } from "@/lib/templates/catalog"

// Global agent template catalog — served from code (read-only product
// content), no database dependency. AWS-only stack.

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category")
  const search = req.nextUrl.searchParams.get("search")?.toLowerCase()

  let templates = TEMPLATE_CATALOG
  if (category && category !== "All") {
    templates = templates.filter((t) => t.category === category)
  }
  if (search) {
    templates = templates.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.role.toLowerCase().includes(search)
    )
  }
  return NextResponse.json({ templates })
}
