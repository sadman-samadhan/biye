import 'server-only'
import { supabaseDriver } from './supabase'
import { r2Driver } from './r2'

/**
 * Private media storage. STORAGE_DRIVER selects the backend:
 *   supabase (default) — private Supabase bucket, signed URLs
 *   r2                 — Cloudflare R2 (needs R2_* env vars)
 * Callers never see which one is active.
 */
export function storage() {
  const driver = (process.env.STORAGE_DRIVER || '').toLowerCase()
  if (driver === 'r2') {
    for (const name of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']) {
      if (!process.env[name]) throw new Error(`STORAGE_DRIVER=r2 requires ${name}`)
    }
    return r2Driver
  }
  return supabaseDriver
}

/** Storage layout. Everything for one site lives under sites/{siteId}/ so it can be purged as a unit. */
export const keys = {
  siteRoot: (siteId) => `sites/${siteId}/`,
  mediaBase: (siteId, mediaId) => `sites/${siteId}/m/${mediaId}`,
  upload: (siteId, mediaId) => `tmp/${siteId}/${mediaId}`,
  variant: (base, name, ext) => `${base}/${name}.${ext}`,
}
