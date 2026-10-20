import { NextResponse } from 'next/server'
import { isSupabaseConfigured, ssrClient } from '@/lib/server/supabase'
import { assertSameOrigin } from '@/lib/server/auth'

export async function POST(request) {
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin
  if (isSupabaseConfigured()) {
    const supabase = await ssrClient()
    await supabase.auth.signOut()
  }
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}
