import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { generatePasscode, normalizePasscode } from '../passcode.js'
import { passcodeKey } from './secrets.js'

/**
 * Passcodes are stored AES-256-GCM encrypted so the couple can always see and
 * share theirs. Kept apart from the cookie code so scripts can use it too
 * (node --conditions=react-server).
 */

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
