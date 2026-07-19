import { NextRequest, NextResponse } from "next/server"
import {
  AdminConfirmSignUpCommand,
  AdminUpdateUserAttributesCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { cognito } from "@/lib/aws/clients"
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, SESSION_COOKIE } from "@/lib/aws/config"
import { sessionCookieOptions } from "@/lib/aws/session"
import { provisionTenant } from "@/lib/aws/tenant"

export async function POST(req: NextRequest) {
  try {
    const { email, password, company } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 })
    }

    // 1. Cognito account
    await cognito().send(
      new SignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
      })
    )
    await cognito().send(
      new AdminConfirmSignUpCommand({ UserPoolId: COGNITO_USER_POOL_ID, Username: email })
    )

    // 2. Company instance on AWS (S3 namespace + DynamoDB record + credits)
    const tenant = await provisionTenant({
      company: company || email.split("@")[0],
      ownerEmail: email,
    })
    await cognito().send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [{ Name: "custom:tenant_id", Value: tenant.tenant_id }],
      })
    )

    // 3. Sign in (fresh token now carries tenant_id)
    const auth = await cognito().send(
      new InitiateAuthCommand({
        ClientId: COGNITO_CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: { USERNAME: email, PASSWORD: password },
      })
    )
    const idToken = auth.AuthenticationResult?.IdToken
    if (!idToken) throw new Error("Authentication did not return a token")

    const res = NextResponse.json({ ok: true, tenant_id: tenant.tenant_id })
    res.cookies.set(SESSION_COOKIE, idToken, sessionCookieOptions())
    return res
  } catch (err: any) {
    const message =
      err?.name === "UsernameExistsException"
        ? "An account with this email already exists"
        : err?.message || "Signup failed"
    console.error("Signup error:", err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
