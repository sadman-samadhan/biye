import { NextResponse } from 'next/server'
import { ssrClient } from '@/lib/server/supabase'
import { assertSameOrigin, getCurrentUser } from '@/lib/server/auth'

/** Signed-in user sets a new password (after an invite or reset link). */
export async function POST(req) {
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Your link has expired. Ask for a new one.' }, { status: 401 })

  const { password } = await req.json().catch(() => ({}))
  if (typeof password !== 'string' || password.length < 10 || password.length > 200) {
    return NextResponse.json({ error: 'Use at least 10 characters' }, { status: 400 })
  }

  const supabase = await ssrClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, redirect: user.isAdmin ? '/admin' : '/dashboard' })
}
