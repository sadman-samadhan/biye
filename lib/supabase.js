import { createClient } from '@supabase/supabase-js'

// Dynamic getters to ensure env vars are fresh even if .env.local was created/edited after server boot
export const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const getSupabaseServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const checkIsConfigured = () => {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  return Boolean((url.startsWith('http://') || url.startsWith('https://')) && key)
}

// Mock client for zero-config offline/demo fallback
const createMockClient = () => ({
  from: (table) => ({
    select: (columns = '*') => ({
      eq: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        single: () => Promise.resolve({ data: null, error: { message: 'Mock: Not found' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      }),
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      single: () => Promise.resolve({ data: null, error: { message: 'Mock: Not found' } }),
      maybeSingle: () => Promise.resolve({ data: null, error: null })
    }),
    insert: (data) => Promise.resolve({ data, error: null }),
    update: (data) => ({
      eq: () => Promise.resolve({ data, error: null })
    }),
    upsert: (data) => Promise.resolve({ data, error: null }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: (path) => ({ data: { publicUrl: `/images/${path}` } })
    }),
    listBuckets: () => Promise.resolve({ data: [{ name: 'site-media' }], error: null }),
    createBucket: () => Promise.resolve({ data: null, error: null })
  }
})

// Client-side / public queries client
export const getSupabaseClient = () => {
  if (!checkIsConfigured()) return createMockClient()
  return createClient(getSupabaseUrl(), getSupabaseAnonKey())
}

export const isSupabaseConfigured = checkIsConfigured()
export const supabase = getSupabaseClient()

// Server-side / Admin client (using service role key if available, else anon key)
export const getSupabaseAdmin = () => {
  const url = getSupabaseUrl()
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey()

  if (!url || !key || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return createMockClient()
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}