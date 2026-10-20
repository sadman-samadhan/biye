import 'server-only'
import { randomUUID } from 'node:crypto'
import { serviceClient } from '../supabase'
import { getSiteAccess } from '../site-data'
import { keys, storage } from '../storage'
import { planLimits } from '../../plans'
import { toMediaToken } from '../../media-ref'
import { processImage, variantMime } from './process'
import { signMedia } from './resolve'

export const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
export const VIDEO_TYPES = { 'video/mp4': 'mp4', 'video/webm': 'webm' }
export const MAX_IMAGE_UPLOAD = 15 * 1024 * 1024
export const SLOTS = new Set(['gallery', 'hero', 'spotlight', 'story', 'ceremony', 'monogram', 'invite', 'video'])

export class MediaError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

async function countMedia(siteId, kind) {
  const { count } = await serviceClient()
    .from('media')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .eq('kind', kind)
    .neq('status', 'failed')
  return count || 0
}

/** Step 1: register an upload and hand the browser a direct-to-storage target. */
export async function startUpload({ site, userId, kind, contentType, bytes, name, slot = 'gallery', album = null }) {
  const limits = planLimits(site)
  if (kind === 'image') {
    if (!IMAGE_TYPES.has(contentType)) throw new MediaError('Use JPEG, PNG or WebP photos', 415)
    if (bytes > MAX_IMAGE_UPLOAD) throw new MediaError('Photo is larger than 15 MB', 413)
    if ((await countMedia(site.id, 'image')) >= limits.photos) {
      throw new MediaError(`This plan includes up to ${limits.photos} photos`, 409)
    }
  } else if (kind === 'video') {
    if (!VIDEO_TYPES[contentType]) throw new MediaError('Use an MP4 or WebM video', 415)
    if (bytes > limits.videoBytes) throw new MediaError(`Videos can be up to ${Math.round(limits.videoBytes / 1048576)} MB on this plan`, 413)
    if ((await countMedia(site.id, 'video')) >= limits.videos) {
      throw new MediaError(`This plan includes up to ${limits.videos} videos`, 409)
    }
  } else {
    throw new MediaError('Unknown upload kind')
  }
  if ((site.storage_used_bytes || 0) + bytes * (kind === 'image' ? 0.5 : 1) > limits.storageBytes) {
    throw new MediaError('Storage for this site is full. Remove some photos first.', 413)
  }

  const id = randomUUID()
  const base = keys.mediaBase(site.id, id)
  const targetKey = kind === 'video' ? keys.variant(base, 'video', VIDEO_TYPES[contentType]) : keys.upload(site.id, id)

  const { error } = await serviceClient().from('media').insert({
    id,
    site_id: site.id,
    kind,
    status: 'pending',
    slot: SLOTS.has(slot) ? slot : 'gallery',
    album: typeof album === 'string' ? album.slice(0, 64) : null,
    storage_key: base,
    original_name: typeof name === 'string' ? name.slice(0, 200) : null,
    uploaded_by: userId || null,
  })
  if (error) throw new MediaError(error.message, 500)

  const upload = await storage().createUploadTarget({ key: targetKey, contentType })
  return { mediaId: id, upload }
}

async function failUpload(siteId, mediaId, tmpKey) {
  await serviceClient().from('media').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', mediaId).eq('site_id', siteId)
  if (tmpKey) await storage().remove([tmpKey]).catch(() => {})
}

/** Step 2: the browser finished uploading; build variants, enforce quota, mark ready. */
export async function completeUpload({ site, mediaId }) {
  const supabase = serviceClient()
  const { data: row } = await supabase.from('media').select('*').eq('id', mediaId).eq('site_id', site.id).maybeSingle()
  if (!row) throw new MediaError('Upload not found', 404)
  if (row.status === 'ready') return summarize(row)
  if (row.status !== 'pending') throw new MediaError('This upload failed. Try again.', 409)

  const limits = planLimits(site)

  if (row.kind === 'video') {
    // The upload target's extension came from the content type; check both possibilities.
    const candidates = Object.values(VIDEO_TYPES).map((e) => ({ e, key: keys.variant(row.storage_key, 'video', e) }))
    let found = null
    for (const c of candidates) {
      const head = await storage().head(c.key)
      if (head) {
        found = { ...c, size: head.size }
        break
      }
    }
    if (!found) throw new MediaError('The video did not finish uploading', 400)
    if (found.size > limits.videoBytes) {
      await storage().remove([found.key])
      await failUpload(site.id, mediaId)
      throw new MediaError('Video is larger than this plan allows', 413)
    }
    const { data: ok } = await supabase.rpc('add_storage_usage', { p_site: site.id, p_delta: found.size, p_quota: limits.storageBytes })
    if (!ok) {
      await storage().remove([found.key])
      await failUpload(site.id, mediaId)
      throw new MediaError('Storage for this site is full', 413)
    }
    const variants = { video: { ext: found.e, bytes: found.size } }
    const { data: updated } = await supabase
      .from('media')
      .update({ status: 'ready', variants, bytes_total: found.size, updated_at: new Date().toISOString() })
      .eq('id', mediaId)
      .select('*')
      .single()
    return summarize(updated)
  }

  const tmpKey = keys.upload(site.id, mediaId)
  const original = await storage().get(tmpKey)
  if (!original) throw new MediaError('The photo did not finish uploading', 400)
  if (original.length > MAX_IMAGE_UPLOAD) {
    await failUpload(site.id, mediaId, tmpKey)
    throw new MediaError('Photo is larger than 15 MB', 413)
  }

  let processed
  try {
    const access = await getSiteAccess(site.id)
    processed = await processImage(original, {
      watermarkText: access?.watermark_mode === 'site' ? `shubhobiye.com/${site.slug}` : undefined,
    })
  } catch {
    await failUpload(site.id, mediaId, tmpKey)
    throw new MediaError('That file could not be read as a photo', 415)
  }

  const total = Object.values(processed.variants).reduce((sum, v) => sum + v.bytes, 0)
  const { data: ok } = await supabase.rpc('add_storage_usage', { p_site: site.id, p_delta: total, p_quota: limits.storageBytes })
  if (!ok) {
    await failUpload(site.id, mediaId, tmpKey)
    throw new MediaError('Storage for this site is full. Remove some photos first.', 413)
  }

  try {
    await Promise.all(
      Object.entries(processed.variants).map(([name, v]) =>
        storage().put(keys.variant(row.storage_key, name, v.ext), v.buffer, { contentType: variantMime(v.format) })
      )
    )
  } catch (err) {
    await supabase.rpc('add_storage_usage', { p_site: site.id, p_delta: -total, p_quota: null })
    await failUpload(site.id, mediaId, tmpKey)
    throw new MediaError(`Could not store the photo: ${err.message}`, 500)
  }
  await storage().remove([tmpKey]).catch(() => {})

  const variants = Object.fromEntries(Object.entries(processed.variants).map(([name, v]) => [name, { w: v.w, h: v.h, bytes: v.bytes, ext: v.ext }]))
  const { data: updated, error } = await supabase
    .from('media')
    .update({
      status: 'ready',
      variants,
      width: processed.width,
      height: processed.height,
      lqip: processed.lqip,
      sha256: processed.sha256,
      bytes_total: total,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaId)
    .select('*')
    .single()
  if (error) throw new MediaError(error.message, 500)
  return summarize(updated)
}

/** Stores a server-generated image (e.g. a monogram PNG) as a single ready variant. */
export async function storeGeneratedImage({ site, buffer, contentType = 'image/png', slot = 'monogram', isPublic = false }) {
  const id = randomUUID()
  const base = keys.mediaBase(site.id, id)
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const { data: ok } = await serviceClient().rpc('add_storage_usage', { p_site: site.id, p_delta: buffer.length, p_quota: planLimits(site).storageBytes })
  if (!ok) throw new MediaError('Storage for this site is full', 413)
  await storage().put(keys.variant(base, 'web', ext), buffer, { contentType })
  const { data, error } = await serviceClient()
    .from('media')
    .insert({
      id,
      site_id: site.id,
      kind: 'image',
      status: 'ready',
      slot,
      storage_key: base,
      variants: { web: { ext, bytes: buffer.length } },
      bytes_total: buffer.length,
      is_public: isPublic,
    })
    .select('*')
    .single()
  if (error) throw new MediaError(error.message, 500)
  return summarize(data)
}

/** Client-facing description of one media row, with fresh signed URLs. */
export async function summarize(row) {
  const urls = (await signMedia([row]))[row.id] || {}
  return {
    id: row.id,
    token: toMediaToken(row.id),
    kind: row.kind,
    slot: row.slot,
    album: row.album,
    width: row.width,
    height: row.height,
    lqip: row.lqip,
    isPublic: row.is_public,
    bytes: Number(row.bytes_total || 0),
    thumb: urls.thumb || urls.web || urls.video || null,
    web: urls.web || urls.video || null,
  }
}
