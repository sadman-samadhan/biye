import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/server/supabase'
import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { assertSameOrigin } from '@/lib/server/auth'
import { clientKey, rateLimitHit } from '@/lib/server/rate-limit'
import { getOwnRsvp, saveRsvp, toGuestRsvp } from '@/lib/server/rsvp'
import { rsvpInputSchema } from '@/lib/content/schema'
import { rsvpState } from '@/lib/invitation'

const PER_DEVICE = { limit: 10, windowS: 10 * 60 }
const PER_SITE = { limit: 400, windowS: 60 * 60 }
const NO_STORE = { 'Cache-Control': 'private, no-store' }

async function load(slug) {
  const found = await getSiteForRequest(slug)
  if (!found) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  if (!found.canView('invite')) return { error: NextResponse.json({ error: 'Passcode required' }, { status: 401 }) }
  const { invitation, ceremonies } = await getSiteContent(found.site.id)
  return { found, state: rsvpState(invitation, ceremonies) }
}

/** This browser's own reply (to prefill the form). */
export async function GET(req, { params }) {
  const { slug } = await params
  const { found, state, error } = await load(slug)
  if (error) return error
  const own = isSupabaseConfigured() ? await getOwnRsvp(found.site.id) : null
  return NextResponse.json({ open: state.open, rsvp: toGuestRsvp(own) }, { headers: NO_STORE })
}

export async function POST(req, { params }) {
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  const { slug } = await params
  const { found, state, error } = await load(slug)
  if (error) return error
  const { site } = found
  // Guests may only reply to live sites (the couple previewing a draft can test the form)
  if (found.status !== 'live' && !found.viewer.canPreview) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!state.open) {
    return NextResponse.json({ error: state.reason === 'closed' ? 'Replies are closed.' : 'This invitation is not taking replies.' }, { status: 409 })
  }

  const parsed = rsvpInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return NextResponse.json({ error: issue?.message || 'Invalid reply', field: issue?.path?.[0] }, { status: 400 })
  }
  const input = parsed.data
  if (input.website) return NextResponse.json({ success: true }) // honeypot

  const allowed = new Set(state.events.map((e) => e.id))
  const events = [...new Set(input.events)].filter((id) => allowed.has(id))
  if (input.attending && !events.length) {
    return NextResponse.json({ error: 'Choose at least one event.', field: 'events' }, { status: 400 })
  }
  if (input.attending && input.partySize > state.settings.maxParty) {
    return NextResponse.json({ error: `At most ${state.settings.maxParty} guests per reply.`, field: 'partySize' }, { status: 400 })
  }
  if (state.settings.collectPhone && input.attending && !input.phone) {
    return NextResponse.json({ error: 'Please add a phone number.', field: 'phone' }, { status: 400 })
  }

  const ip = await clientKey()
  if (!(await rateLimitHit(`rsvp:${site.id}:${ip}`, PER_DEVICE)) || !(await rateLimitHit(`rsvp:${site.id}`, PER_SITE))) {
    return NextResponse.json({ error: 'Too many replies. Please wait a few minutes.' }, { status: 429 })
  }

  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })

  try {
    const row = await saveRsvp(site.id, { ...input, events })
    return NextResponse.json({ success: true, rsvp: toGuestRsvp(row) }, { headers: NO_STORE })
  } catch (err) {
    console.warn('[rsvp]', err.message)
    return NextResponse.json({ error: 'Could not save your reply. Please try again.' }, { status: 500 })
  }
}
