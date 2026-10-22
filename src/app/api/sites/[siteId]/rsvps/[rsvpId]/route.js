import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'

/** Removes one reply (spam or a duplicate). */
export async function DELETE(req, { params }) {
  const { siteId, rsvpId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const { data, error } = await serviceClient().from('rsvps').delete().eq('id', rsvpId).eq('site_id', siteId).select('id')
  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
