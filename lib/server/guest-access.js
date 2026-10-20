import 'server-only'
import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { generatePasscode, normalizePasscode } from '../passcode'
import { guestSessionSecret, linkSigningSecret, passcodeKey } from './secrets'

const SESSION_DAYS = 30
const AUDIENCE = 'shb-guest'

// ---- Passcode storage (AES-256-GCM, so the couple can see and share it) ------------

export function encryptPasscode(plain) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', passcodeKey(), iv)
  const data = Buffer.concat([cipher.update(normalizePasscode(plain), 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.')
}

export function decryptPasscode(stored) {
  if (!stored) return null
  try {
    const [version, iv, tag, data] = stored.split('.')
    if (version !== 'v1') return null
    const decipher = createDecipheriv('aes-256-gcm', passcodeKey(), Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

export const newPasscode = () => generatePasscode((n) => randomInt(n))

/** Constant-time comparison of a guest's attempt with the stored passcode. */
export function passcodeMatches(attempt, stored) {
  const expected = decryptPasscode(stored)
  if (!expected) return false
  const a = Buffer.from(normalizePasscode(attempt))
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

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
