import { SignJWT, jwtVerify } from 'jose'

/**
 * Signed admin session token (stopgap until Supabase Auth roles land in Phase 1).
 * Pure module with no next/* imports, so it can run inside src/proxy.js.
 */

export const ADMIN_COOKIE = 'shb_admin'
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12

const AUDIENCE = 'shb-admin'

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

export function isAdminAuthConfigured() {
  return Boolean(getSecret() && process.env.ADMIN_PASSWORD)
}

export async function createAdminToken() {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_SESSION_SECRET must be set (32+ characters)')
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience(AUDIENCE)
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .sign(secret)
}

export async function verifyAdminToken(token) {
  const secret = getSecret()
  if (!secret || !token) return false
  try {
    const { payload } = await jwtVerify(token, secret, { audience: AUDIENCE, algorithms: ['HS256'] })
    return payload.role === 'admin'
  } catch {
    return false
  }
}
