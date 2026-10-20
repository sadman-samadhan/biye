import { NextResponse } from 'next/server'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { getSiteAccess } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { isDemoSiteId } from '@/lib/demo'
import { assertSameOrigin } from '@/lib/server/auth'
import { clientKey, rateLimitHit } from '@/lib/server/rate-limit'

const POST_LIMIT = { limit: 5, windowS: 10 * 60 }

function clean(value, max) {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\s+/g, ' ').trim()
  return trimmed ? trimmed.slice(0, max) : null
}

export async function GET(req, { params }) {
  const { slug } = await params
  const found = await getSiteForRequest(slug)
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!found.canView(found.scope)) return NextResponse.json({ error: 'Passcode required' }, { status: 401 })
  const { site } = found
  if (isDemoSiteId(site.id) || !isSupabaseConfigured()) return NextResponse.json({ messages: [] })

  const { data } = await serviceClient()
    .from('messages')
    .select('id, name, name_bn, message, message_bn, created_at')
    .eq('site_id', site.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ messages: data || [] }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(req, { params }) {
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  const { slug } = await params
  const found = await getSiteForRequest(slug)
  // Guests may only write to live sites (operators previewing a draft can test the form)
  if (!found || (found.status !== 'live' && !found.viewer.canPreview)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!found.canView(found.scope)) return NextResponse.json({ error: 'Passcode required' }, { status: 401 })
  const { site } = found

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  // Honeypot: real visitors never see or fill this field.
  if (body.website) return NextResponse.json({ success: true })

  const name = clean(body.name, 50)
  const message = clean(body.message, 300)
  if (!name || !message) {
    return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
  }

  if (!(await rateLimitHit(`msg:${site.id}:${await clientKey()}`, POST_LIMIT))) {
    return NextResponse.json({ error: 'Too many messages. Please wait a few minutes.' }, { status: 429 })
  }

  if (isDemoSiteId(site.id) || !isSupabaseConfigured()) {
    return NextResponse.json({ success: true, demo: true })
  }

  const access = await getSiteAccess(site.id)
  const approved = (access?.message_moderation || 'auto') === 'auto'

  const { error } = await serviceClient().from('messages').insert({
    site_id: site.id,
    name,
    name_bn: clean(body.nameBn, 50),
    message,
    message_bn: clean(body.messageBn, 300),
    approved,
  })

  if (error) return NextResponse.json({ error: 'Unable to save message' }, { status: 500 })
  return NextResponse.json({ success: true, pendingApproval: !approved })
}
