import 'server-only'
import { hkdfSync } from 'node:crypto'

/**
 * App secrets. Each can be set explicitly (recommended in production); if not,
 * it is derived from SUPABASE_SERVICE_ROLE_KEY with HKDF so local setups work
 * without extra configuration. Rotating the service key then also rotates these
 * (guests sign in again; passcodes must be reset).
 */
function derive(envName, info, bytes = 32) {
  const explicit = process.env[envName]
  if (explicit && explicit.length >= 32) return Buffer.from(explicit)
  const root = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!root) throw new Error(`${envName} (or SUPABASE_SERVICE_ROLE_KEY) must be set`)
  return Buffer.from(hkdfSync('sha256', root, 'shubhobiye', info, bytes))
}

export const guestSessionSecret = () => derive('GUEST_SESSION_SECRET', 'guest-session')
export const linkSigningSecret = () => derive('LINK_SIGNING_SECRET', 'unlock-links')

/** 32-byte AES key. PASSCODE_ENC_KEY may be base64 (44 chars) or any 32+ char string. */
export function passcodeKey() {
  const explicit = process.env.PASSCODE_ENC_KEY
  if (explicit) {
    const asBase64 = Buffer.from(explicit, 'base64')
    if (asBase64.length === 32) return asBase64
    return Buffer.from(hkdfSync('sha256', explicit, 'shubhobiye', 'passcode', 32))
  }
  return derive('__unused__', 'passcode-encryption')
}
