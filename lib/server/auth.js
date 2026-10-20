import 'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { hasAuthCookie, isSupabaseConfigured, serviceClient, ssrClient } from './supabase'

export const SITE_ROLES = ['owner', 'editor']

/**
 * The signed-in Supabase Auth user for this request, or null.
 * Admins are users whose app_metadata.role is 'admin' (set by scripts/make_admin.mjs;
 * app_metadata cannot be changed by the user themselves).
 */
export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured()) return null
  const cookieStore = await cookies()
  if (!hasAuthCookie(cookieStore.getAll())) return null

  const supabase = await ssrClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (error || !claims?.sub) return null

  return {
    id: claims.sub,
    email: claims.email || null,
    isAdmin: claims.app_metadata?.role === 'admin',
  }
})

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const forbidden = () => NextResponse.json({ error: 'Forbidden' }, { status: 403 })

/** Route-handler guard. Returns an error response, or null when the caller is an admin. */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  if (!user.isAdmin) return forbidden()
  return null
}

/** Route-handler guard for a signed-in user of any kind. */
export async function requireUser() {
  const user = await getCurrentUser()
  return user ? { user } : { denied: unauthorized() }
}

/**
 * Membership role of the current user on a site: 'admin' | 'owner' | 'editor' | null.
 */
export const getSiteRole = cache(async (siteId) => {
  const user = await getCurrentUser()
  if (!user || !siteId) return null
  if (user.isAdmin) return 'admin'
  const { data } = await serviceClient()
    .from('site_members')
    .select('role')
    .eq('site_id', siteId)
    .eq('user_id', user.id)
    .maybeSingle()
  return data?.role ?? null
})

/**
 * Route-handler guard for site-scoped APIs. Admins always pass.
 * Usage: const { denied, user, role } = await authorizeSite(siteId); if (denied) return denied
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function authorizeSite(siteId, roles = SITE_ROLES) {
  const user = await getCurrentUser()
  if (!user) return { denied: unauthorized() }
  if (!UUID.test(String(siteId))) return { denied: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  const role = await getSiteRole(siteId)
  if (role === 'admin' || (role && roles.includes(role))) {
    return { user, role, isAdmin: role === 'admin' }
  }
  // 404 rather than 403 so site ids can't be probed for existence
  return { denied: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
}

/**
 * CSRF defence for state-changing routes: when the browser sends an Origin header
 * it must match this host. Returns an error response or null.
 */
export async function assertSameOrigin() {
  const h = await headers()
  const origin = h.get('origin')
  if (!origin) return null
  const host = h.get('x-forwarded-host') || h.get('host')
  try {
    if (new URL(origin).host === host) return null
  } catch {
    // fall through
  }
  return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 })
}

/** Page guards (Server Components). */
export async function requireUserPage(next = '/dashboard') {
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`)
  return user
}

export async function requireAdminPage(next = '/admin') {
  const user = await requireUserPage(next)
  if (!user.isAdmin) redirect('/dashboard')
  return user
}
