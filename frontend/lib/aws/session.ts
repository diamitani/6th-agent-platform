// Cognito-backed sessions: the ID token lives in an httpOnly cookie and is
// verified against the user pool's JWKS on every server-side read.

import { cookies } from "next/headers"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { AWS_REGION, COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, SESSION_COOKIE } from "./config"

const ISSUER = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`

let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null
function jwks() {
  if (!_jwks) _jwks = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`))
  return _jwks
}

export interface Session {
  sub: string
  email: string
  tenantId: string | null
}

export async function getSession(): Promise<Session | null> {
  try {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, jwks(), {
      issuer: ISSUER,
      audience: COGNITO_CLIENT_ID,
    })
    return {
      sub: String(payload.sub),
      email: String(payload.email || ""),
      tenantId: (payload["custom:tenant_id"] as string) || null,
    }
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAgeSeconds = 60 * 60 * 24) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  }
}
