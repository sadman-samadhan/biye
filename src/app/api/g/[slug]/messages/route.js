import { NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { getSiteBySlug, isDemoSiteId } from '@/lib/getData'
import { clientIp, hitLimit } from '@/lib/server/rate-limit'

const POST_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }

function clean(value, max) {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\s+/g, ' ').trim()
  return trimmed ? trimmed.slice(0, max) : null
}

async function findPublicSite(params) {
  const { slug } = await params
  return getSiteBySlug(slug, false)
}

export async function GET(req, { params }) {
  const site = await findPublicSite(params)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (isDemoSiteId(site.id) || !isSupabaseConfigured) return NextResponse.json({ messages: [] })

  const { data, error } = await getSupabaseAdmin()
    .from('messages')
    .select('id, name, name_bn, message, message_bn, created_at')
    .eq('site_id', site.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ messages: [] })
  return NextResponse.json({ messages: data || [] })
}

export async function POST(req, { params }) {
  const site = await findPublicSite(params)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot: real visitors never see or fill this field.
  if (body.website) return NextResponse.json({ success: true })

  const name = clean(body.name, 50)
  const message = clean(body.message, 300)
  if (!name || !message) {
    return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
  }

  const { allowed } = hitLimit(`msg:${site.id}:${clientIp(req)}`, POST_LIMIT)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many messages. Please wait a few minutes.' }, { status: 429 })
  }

  if (isDemoSiteId(site.id) || !isSupabaseConfigured) {
    return NextResponse.json({ success: true, demo: true })
  }

  const { error } = await getSupabaseAdmin()
    .from('messages')
    .insert({
      site_id: site.id,
      name,
      name_bn: clean(body.nameBn, 50),
      message,
      message_bn: clean(body.messageBn, 300),
      approved: true,
    })

  if (error) return NextResponse.json({ error: 'Unable to save message' }, { status: 500 })
  return NextResponse.json({ success: true })
}
