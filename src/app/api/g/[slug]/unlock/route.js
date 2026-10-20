import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { assertSameOrigin } from '@/lib/server/auth'
import { getSiteForRequest } from '@/lib/server/site-view'
import { passcodeMatches, setGuestSession } from '@/lib/server/guest-access'
import { clientKey, rateLimitBlocked, rateLimitHit } from '@/lib/server/rate-limit'

// Only failures count. Per-IP limits are generous because many Bangladeshi
// mobile users share one carrier IP; the per-device and per-site caps stop
// scripted guessing. While any limit is hit, every attempt (even a correct one)
// is refused, so throttling can't be used to confirm a guess.
const PER_IP = { limit: 30, windowS: 10 * 60 }
const PER_DEVICE = { limit: 8, windowS: 10 * 60 }
const PER_SITE = { limit: 300, windowS: 60 * 60 }
const DEVICE_COOKIE = 'shb_dev'

export async function POST(req, { params }) {
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { slug } = await params
  const found = await getSiteForRequest(slug)
  if (!found || !found.access) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { site, access } = found

  const store = await cookies()
  let device = store.get(DEVICE_COOKIE)?.value
  if (!device || !/^[A-Za-z0-9_-]{16,32}$/.test(device)) {
    device = randomBytes(12).toString('base64url')
    store.set(DEVICE_COOKIE, device, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 30 * 86400 })
  }

  const keys = {
    ip: [`unlock:ip:${site.id}:${await clientKey()}`, PER_IP],
    device: [`unlock:dev:${site.id}:${device}`, PER_DEVICE],
    site: [`unlock:site:${site.id}`, PER_SITE],
  }
  for (const [key, limit] of Object.values(keys)) {
    if (await rateLimitBlocked(key, limit)) {
      return NextResponse.json({ error: 'Too many tries. Please wait 10 minutes and try again.' }, { status: 429 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.replace(/\s+/g, ' ').trim().slice(0, 60) : ''

  if (!access.passcode_enc || !passcodeMatches(body.passcode, access.passcode_enc)) {
    for (const [key, limit] of Object.values(keys)) await rateLimitHit(key, limit)
    return NextResponse.json({ error: 'That passcode didn’t work. Check your invitation and try again.' }, { status: 401 })
  }

  await setGuestSession({ siteId: site.id, passcodeVersion: access.passcode_version, name })
  return NextResponse.json({ success: true })
}
