/** Only allow same-site relative redirect targets (no //evil.com, no schemes). */
export function safeNextPath(next, fallback = '/dashboard') {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback
  }
  return next
}
