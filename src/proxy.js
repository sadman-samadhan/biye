import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Keeps the Supabase Auth session fresh and gives friendly redirects for the
 * operator console and couple dashboard. This is a UX layer only: every page
 * and route handler re-checks access itself (lib/server/auth.js).
 */
export async function proxy(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })
  let claims = null

  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of list) response.cookies.set(name, value, options)
        },
      },
    })
    const { data } = await supabase.auth.getClaims()
    claims = data?.claims ?? null
  }

  const redirectTo = (target) => {
    const redirect = NextResponse.redirect(new URL(target, request.url))
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
    return redirect
  }

  const isOperatorPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isDashboardPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if ((isOperatorPage || isDashboardPage) && !claims) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname)}`)
  }
  if (isOperatorPage && claims?.app_metadata?.role !== 'admin') {
    return redirectTo('/dashboard')
  }
  if (pathname.startsWith('/api/') && !claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/sites/:path*',
    '/api/upload',
    '/api/monogram',
    '/api/palette',
    '/login',
    '/auth/:path*',
  ],
}
