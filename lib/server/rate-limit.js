import 'server-only'
import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { isSupabaseConfigured, serviceClient } from './supabase'

/**
 * Fixed-window rate limiting backed by the Postgres rl_hit()/rl_blocked() RPCs,
 * so limits hold across serverless instances. Falls back to an in-memory window
 * (per instance) when the database is unavailable.
 */

const memory = new Map()

function memoryHit(key, limit, windowS) {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || now - entry.start >= windowS * 1000) {
    memory.set(key, { start: now, hits: 1 })
    return 1 <= limit
  }
  entry.hits += 1
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (now - v.start >= windowS * 1000) memory.delete(k)
  }
  return entry.hits <= limit
}

function memoryBlocked(key, limit, windowS) {
  const entry = memory.get(key)
  if (!entry || Date.now() - entry.start >= windowS * 1000) return false
  return entry.hits >= limit
}

/** Records a hit. Returns true while the caller is within the limit. */
export async function rateLimitHit(key, { limit, windowS }) {
  if (isSupabaseConfigured()) {
    const { data, error } = await serviceClient().rpc('rl_hit', { p_key: key, p_limit: limit, p_window_s: windowS })
    if (!error) return data === true
    console.warn('[rate-limit] rl_hit failed, using memory:', error.message)
  }
  return memoryHit(key, limit, windowS)
}

/** True when the key is over its limit, without recording a hit. */
export async function rateLimitBlocked(key, { limit, windowS }) {
  if (isSupabaseConfigured()) {
    const { data, error } = await serviceClient().rpc('rl_blocked', { p_key: key, p_limit: limit, p_window_s: windowS })
    if (!error) return data === true
    console.warn('[rate-limit] rl_blocked failed, using memory:', error.message)
  }
  return memoryBlocked(key, limit, windowS)
}

/**
 * Client IP, hashed so raw addresses are never stored. On Vercel x-real-ip is
 * set by the platform; elsewhere it falls back to the first forwarded hop.
 */
export async function clientKey() {
  const h = await headers()
  const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const salt = process.env.IP_HASH_SALT || 'shubhobiye'
  return createHmac('sha256', salt).update(ip).digest('base64url').slice(0, 22)
}
