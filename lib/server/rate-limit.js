import 'server-only'

/**
 * In-memory fixed-window limiter. Per server instance only, so it is a stopgap
 * until the Postgres-backed rl_hit() limiter lands. Good enough to blunt
 * scripted guessing against a single warm instance.
 */
const buckets = new Map()

export function hitLimit(key, { limit, windowMs }) {
  const now = Date.now()
  const entry = buckets.get(key)
  if (!entry || now - entry.start >= windowMs) {
    buckets.set(key, { start: now, hits: 1 })
    return { allowed: true, remaining: limit - 1 }
  }
  entry.hits += 1
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now - v.start >= windowMs) buckets.delete(k)
  }
  return { allowed: entry.hits <= limit, remaining: Math.max(0, limit - entry.hits) }
}

export function isLimited(key, { limit, windowMs }) {
  const entry = buckets.get(key)
  if (!entry) return false
  if (Date.now() - entry.start >= windowMs) return false
  return entry.hits >= limit
}

export function clientIp(req) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
