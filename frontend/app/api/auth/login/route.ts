import { NextRequest, NextResponse } from "next/server"
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"
import { cognito } from "@/lib/aws/clients"
import { COGNITO_CLIENT_ID, SESSION_COOKIE } from "@/lib/aws/config"
import { sessionCookieOptions } from "@/lib/aws/session"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 })
    }

    const auth = await cognito().send(
      new InitiateAuthCommand({
        ClientId: COGNITO_CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: { USERNAME: email, PASSWORD: password },
      })
    )
    const idToken = auth.AuthenticationResult?.IdToken
    if (!idToken) throw new Error("Authentication failed")

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, idToken, sessionCookieOptions())
    return res
  } catch (err: any) {
    const message =
      err?.name === "NotAuthorizedException"
        ? "Incorrect email or password"
        : err?.message || "Login failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
