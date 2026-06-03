import { SignJWT, jwtVerify } from 'jose'
import type { Role } from '@prisma/client'

const JWT_ISSUER = 'folio-bu'
const JWT_AUDIENCE = 'folio-bu-api'
const TOKEN_TTL = '7d'

export type JwtPayload = {
  sub: string
  role: Role
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET (or NEXTAUTH_SECRET) is not configured')
  }
  return new TextEncoder().encode(secret)
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret())
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })

    const sub = payload.sub
    const role = payload.role as Role | undefined
    if (!sub || !role) return null

    return { sub, role }
  } catch {
    return null
  }
}
