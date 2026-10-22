import { NextResponse } from 'next/server'
import { isSupabaseConfigured, ssrClient } from '@/lib/server/supabase'
import { assertSameOrigin } from '@/lib/server/auth'
import { clientKey, rateLimitBlocked, rateLimitHit } from '@/lib/server/rate-limit'
import { safeNextPath } from '@/lib/server/redirects'

// Per-IP failures do most of the work; the per-email cap is higher so an attacker
// can't trivially lock a couple out of their own account.
const IP_FAILURES = { limit: 8, windowS: 15 * 60 }
const EMAIL_FAILURES = { limit: 25, windowS: 15 * 60 }

export async function POST(req) {
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Sign-in is not configured on this server.' }, { status: 503 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : ''
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const ipKey = `login:ip:${await clientKey()}`
  const emailKey = `login:email:${email}`
  if ((await rateLimitBlocked(ipKey, IP_FAILURES)) || (await rateLimitBlocked(emailKey, EMAIL_FAILURES))) {
    return NextResponse.json({ error: 'Too many attempts. Please wait 15 minutes.' }, { status: 429 })
  }

  const supabase = await ssrClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  // Supabase's own sign-in limit: not a wrong password, so don't count it as one
  if (error?.status === 429) {
    return NextResponse.json({ error: 'Too many sign-ins right now. Please wait a few minutes.' }, { status: 429 })
  }
  if (error || !data?.user) {
    await rateLimitHit(ipKey, IP_FAILURES)
    await rateLimitHit(emailKey, EMAIL_FAILURES)
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  const isAdmin = data.user.app_metadata?.role === 'admin'
  const fallback = isAdmin ? '/admin' : '/dashboard'
  let redirect = safeNextPath(body.next, fallback)
  if (redirect.startsWith('/admin') && !isAdmin) redirect = '/dashboard'
  return NextResponse.json({ success: true, redirect })
}
