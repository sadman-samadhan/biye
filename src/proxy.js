import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/server/admin-token'

const PUBLIC_PATHS = new Set(['/admin/login', '/api/admin/auth'])

/**
 * UX-level gate for operator surfaces. Every route handler also checks the
 * session itself (requireAdmin); never rely on this proxy alone.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()

  const isAdmin = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)
  if (isAdmin) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/upload', '/api/monogram', '/api/palette'],
}
