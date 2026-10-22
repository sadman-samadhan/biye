import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { guestSessionSecret, linkSigningSecret } from './secrets'

// Passcode storage lives in its own module so scripts can use it too
export { decryptPasscode, encryptPasscode, newPasscode, passcodeMatches } from './passcode-crypto.js'

const SESSION_DAYS = 30
const AUDIENCE = 'shb-guest'

// ---- Unlock links (/{slug}/u/{key}) -------------------------------------------------

/** Changes whenever the passcode version changes, so rotating the passcode kills old links. */
export function unlockKey(siteId, passcodeVersion) {
  return createHmac('sha256', linkSigningSecret()).update(`unlock:${siteId}:${passcodeVersion}`).digest('base64url').slice(0, 22)
}

export function unlockKeyValid(siteId, passcodeVersion, key) {
  const expected = Buffer.from(unlockKey(siteId, passcodeVersion))
  const given = Buffer.from(String(key || ''))
  return given.length === expected.length && timingSafeEqual(given, expected)
}

// ---- Guest session cookie (one per site) ------------------------------------------

export const guestCookieName = (siteId) => `shb_g_${String(siteId).replace(/-/g, '')}`

function secretKey() {
  return new Uint8Array(guestSessionSecret())
}

export async function issueGuestToken({ siteId, passcodeVersion, name }) {
  return new SignJWT({ sid: siteId, pv: passcodeVersion, ...(name ? { nm: name } : {}) })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey())
}

/** Sets the guest cookie. Only callable from Route Handlers / Server Actions. */
export async function setGuestSession({ siteId, passcodeVersion, name }) {
  const token = await issueGuestToken({ siteId, passcodeVersion, name })
  const store = await cookies()
  store.set(guestCookieName(siteId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  })
}

/**
 * The verified guest session for a site, or null. A session stops working as
 * soon as the passcode version changes (rotate passcode / sign out everyone).
 */
export async function readGuestSession(siteId, passcodeVersion) {
  const store = await cookies()
  const token = store.get(guestCookieName(siteId))?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), { audience: AUDIENCE, algorithms: ['HS256'] })
    if (payload.sid !== siteId || payload.pv !== passcodeVersion) return null
    return { name: typeof payload.nm === 'string' ? payload.nm : null }
  } catch {
    return null
  }
}
