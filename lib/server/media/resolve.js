import 'server-only'
import { collectMediaIds, mapMediaTokens, mediaIdOf } from '../../media-ref'
import { isSupabaseConfigured, serviceClient } from '../supabase'
import { keys, storage } from '../storage'

const SIGNED_TTL = 2 * 60 * 60

/** Media rows (ready, belonging to the site) for a set of ids. */
export async function loadMedia(siteId, ids) {
  if (!ids.size || !isSupabaseConfigured()) return new Map()
  const { data } = await serviceClient()
    .from('media')
    .select('id, kind, storage_key, variants, width, height, lqip, is_public, alt, caption, album')
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .in('id', [...ids])
  return new Map((data || []).map((row) => [row.id, row]))
}

function variantKey(row, name) {
  const v = row.variants?.[name]
  return v ? keys.variant(row.storage_key, name, v.ext) : null
}

/**
 * Signed URLs for media rows: { [id]: { web, thumb, video, width, height, lqip } }.
 * `publicOnly` drops media not marked is_public (for pages shown without a guest session).
 */
export async function signMedia(rows, { publicOnly = false, variants = ['web', 'thumb'] } = {}) {
  const wanted = []
  for (const row of rows) {
    if (publicOnly && !row.is_public) continue
    for (const name of row.kind === 'video' ? ['video'] : variants) {
      const key = variantKey(row, name)
      if (key) wanted.push(key)
    }
  }
  const signed = wanted.length ? await storage().signGet(wanted, { ttl: SIGNED_TTL }) : new Map()

  const out = {}
  for (const row of rows) {
    if (publicOnly && !row.is_public) continue
    const entry = { width: row.width, height: row.height, lqip: row.lqip, kind: row.kind }
    for (const name of row.kind === 'video' ? ['video'] : variants) {
      const key = variantKey(row, name)
      if (key && signed.has(key)) entry[name] = signed.get(key)
    }
    out[row.id] = entry
  }
  return out
}

/**
 * Replaces media tokens inside site content with signed URLs. Gallery items
 * additionally get thumb/size/placeholder fields for layout without shifts.
 * Unknown or non-visible media resolve to '' so nothing private leaks.
 */
export async function resolveContentMedia(siteId, content, { publicOnly = false } = {}) {
  const ids = collectMediaIds(content)
  if (!ids.size) return content
  const rows = await loadMedia(siteId, ids)
  const urls = await signMedia([...rows.values()], { publicOnly })

  const resolved = mapMediaTokens(content, (id) => urls[id]?.web || urls[id]?.video || '')

  if (Array.isArray(content.gallery)) {
    resolved.gallery = content.gallery
      .map((item) => {
        const id = mediaIdOf(item?.filename)
        if (!id) return item
        const media = urls[id]
        if (!media?.web) return null
        return {
          ...item,
          id,
          filename: media.web,
          thumbSrc: media.thumb || media.web,
          width: media.width || item.width,
          height: media.height || item.height,
          lqip: media.lqip,
        }
      })
      .filter(Boolean)
  }
  return resolved
}
