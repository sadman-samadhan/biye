import 'server-only'
import { cache } from 'react'
import { isSupabaseConfigured, serviceClient } from './supabase'

export const EMPTY_CONTENT = Object.freeze({
  content: {},
  ceremonies: [],
  duas: { duas: [], parentBlessings: {} },
  gallery: [],
  invitation: {},
  version: 1,
})

/** Raw site row by slug, regardless of status (visibility is decided in site-view.js). */
export const getSiteBySlug = cache(async (slug) => {
  if (!slug || typeof slug !== 'string') return null

  if (!isSupabaseConfigured()) return null
  const { data, error } = await serviceClient().from('sites').select('*').eq('slug', slug).maybeSingle()
  if (error) console.warn(`[getSiteBySlug] ${slug}:`, error.message)
  return data || null
})

export const getSiteById = cache(async (siteId) => {
  if (!siteId || !isSupabaseConfigured()) return null
  const { data } = await serviceClient().from('sites').select('*').eq('id', siteId).maybeSingle()
  return data || null
})

/** Content for a site (empty when it has none yet). */
export const getSiteContent = cache(async (siteId) => {
  if (!siteId || !isSupabaseConfigured()) return EMPTY_CONTENT

  const { data, error } = await serviceClient()
    .from('site_content')
    .select('content, ceremonies, duas, gallery, invitation, version')
    .eq('site_id', siteId)
    .maybeSingle()

  if (error) console.warn(`[getSiteContent] ${siteId}:`, error.message)
  if (!data) return EMPTY_CONTENT
  return {
    content: data.content || {},
    ceremonies: data.ceremonies || [],
    duas: data.duas || { duas: [], parentBlessings: {} },
    gallery: data.gallery || [],
    invitation: data.invitation || {},
    version: data.version || 1,
  }
})

export const getSiteAccess = cache(async (siteId) => {
  if (!siteId || !isSupabaseConfigured()) return null
  const { data } = await serviceClient().from('site_access').select('*').eq('site_id', siteId).maybeSingle()
  return data || null
})

/** A live site whose paid period has lapsed behaves as expired. */
export function effectiveStatus(site) {
  if (!site) return null
  if (site.status === 'live' && site.plan_expiry_date && new Date(site.plan_expiry_date) < new Date()) {
    return 'expired'
  }
  return site.status
}

export async function writeAudit({ actorKind, actorId, siteId, action, meta = {} }) {
  if (!isSupabaseConfigured()) return
  const { error } = await serviceClient().from('audit_log').insert({
    actor_kind: actorKind,
    actor_id: actorId ? String(actorId) : null,
    site_id: siteId || null,
    action,
    meta,
  })
  if (error) console.warn('[audit]', action, error.message)
}
