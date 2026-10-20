import { NextResponse } from 'next/server'
import { ssrClient } from '@/lib/server/supabase'
import { safeNextPath } from '@/lib/server/redirects'

const OTP_TYPES = new Set(['invite', 'recovery', 'magiclink', 'email', 'signup'])

/**
 * Landing point for invite / password-reset / magic links that the operator
 * sends to a couple (usually over WhatsApp). Exchanges the one-time token for a
 * session, then continues to `next` (e.g. /dashboard/set-password).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = safeNextPath(searchParams.get('next'), '/dashboard')

  if (tokenHash && OTP_TYPES.has(type)) {
    const supabase = await ssrClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      const response = NextResponse.redirect(new URL(next, request.url))
      response.headers.set('Referrer-Policy', 'no-referrer')
      return response
    }
  }

  return NextResponse.redirect(new URL('/login?error=link', request.url))
}
