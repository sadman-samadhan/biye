import 'server-only'
import { collectMediaIds } from '../../media-ref'
import { serviceClient } from '../supabase'
import { keys, storage } from '../storage'

/** Storage keys of every variant of a media row. */
export function mediaObjectKeys(row) {
  return Object.entries(row.variants || {}).map(([name, v]) => keys.variant(row.storage_key, name, v.ext))
}

/** Deletes media rows + their objects and returns the freed bytes to the site's quota. */
export async function deleteMediaRows(siteId, rows) {
  if (!rows.length) return 0
  await storage().remove(rows.flatMap((row) => [...mediaObjectKeys(row), keys.upload(siteId, row.id)]))
  const ids = rows.map((r) => r.id)
  const { error } = await serviceClient().from('media').delete().eq('site_id', siteId).in('id', ids)
  if (error) throw new Error(error.message)
  const freed = rows.reduce((sum, r) => sum + Number(r.bytes_total || 0), 0)
  if (freed) await serviceClient().rpc('add_storage_usage', { p_site: siteId, p_delta: -freed, p_quota: null })
  return rows.length
}

/**
 * Removes media no longer referenced by the site's content (e.g. a photo removed
 * from the gallery and saved). Recent uploads are kept so unsaved edits survive.
 */
export async function collectUnreferencedMedia(siteId, { graceMinutes = 360 } = {}) {
  const supabase = serviceClient()
  const { data: content } = await supabase
    .from('site_content')
    .select('content, ceremonies, duas, gallery, invitation')
    .eq('site_id', siteId)
    .maybeSingle()
  const referenced = collectMediaIds(content || {})

  const cutoff = new Date(Date.now() - graceMinutes * 60_000).toISOString()
  const { data: candidates } = await supabase
    .from('media')
    .select('id, storage_key, variants, bytes_total, slot')
    .eq('site_id', siteId)
    .lt('created_at', cutoff)
  const orphans = (candidates || []).filter((row) => !referenced.has(row.id) && row.slot !== 'og')
  return deleteMediaRows(siteId, orphans)
}
