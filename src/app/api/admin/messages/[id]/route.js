import { NextResponse } from 'next/server'
import { assertSameOrigin, requireAdmin } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'

export async function PUT(req, { params }) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  const { id } = await params

  const { approved } = await req.json().catch(() => ({}))
  if (typeof approved !== 'boolean') return NextResponse.json({ error: 'approved must be true or false' }, { status: 400 })

  const { error } = await serviceClient().from('messages').update({ approved }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req, { params }) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  const { id } = await params

  const { error } = await serviceClient().from('messages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
