import { NextRequest, NextResponse } from "next/server"

// Legacy OAuth callback path (was Supabase PKCE). Auth is now AWS Cognito
// via /api/auth/* — anything landing here just goes to the dashboard.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/command", req.url))
}
