import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'

/** Approve / hide a guestbook message. Always scoped to the site (no cross-site ids). */
export async function PATCH(req, { params }) {
  const { siteId, messageId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { approved } = await req.json().catch(() => ({}))
  if (typeof approved !== 'boolean') return NextResponse.json({ error: 'approved must be true or false' }, { status: 400 })

  const { data, error } = await serviceClient()
    .from('messages')
    .update({ approved })
    .eq('id', messageId)
    .eq('site_id', siteId)
    .select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req, { params }) {
  const { siteId, messageId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { data, error } = await serviceClient()
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('site_id', siteId)
    .select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
