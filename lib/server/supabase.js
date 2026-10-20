import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function isSupabaseConfigured() {
  return /^https?:\/\//.test(url()) && Boolean(anonKey() && serviceKey())
}

let serviceSingleton = null

/**
 * Service-role client. Bypasses RLS, so callers must authorize first.
 * Fails closed: never falls back to the anon key.
 */
export function serviceClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured (URL, anon key and service role key are required)')
  }
  serviceSingleton ??= createClient(url(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return serviceSingleton
}

/**
 * Cookie-bound client for the signed-in operator/couple (Supabase Auth session).
 * Writing cookies only works in Route Handlers, Server Actions and the proxy;
 * during Server Component render the write is skipped (the proxy refreshes tokens).
 */
export async function ssrClient() {
  const cookieStore = await cookies()
  return createServerClient(url(), anonKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options)
        } catch {
          // Called from a Server Component: ignore, the proxy keeps the session fresh.
        }
      },
    },
  })
}

export function hasAuthCookie(cookieList) {
  return cookieList.some(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'))
}
