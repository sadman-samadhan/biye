import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/admin-session'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function PUT(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied

  const resolvedParams = await params
  const id = resolvedParams?.id

  try {
    const { approved } = await req.json()
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('messages')
      .update({ approved })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied

  const resolvedParams = await params
  const id = resolvedParams?.id

  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
