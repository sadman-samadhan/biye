import 'server-only'
import { serviceClient } from '../supabase'

export const PRIVATE_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'site-media-private'

// Supabase signs with "now"; reuse a signed URL for most of its life so browsers
// can cache images between page views instead of re-downloading every visit.
const signedCache = new Map()
const MAX_CACHE = 5000

function bucket() {
  return serviceClient().storage.from(PRIVATE_BUCKET)
}

/** Supabase Storage driver for private media (default; free tier friendly). */
export const supabaseDriver = {
  name: 'supabase',

  async createUploadTarget({ key, contentType }) {
    const { data, error } = await bucket().createSignedUploadUrl(key)
    if (error) throw new Error(`Could not create upload URL: ${error.message}`)
    return {
      method: 'PUT',
      url: data.signedUrl,
      headers: {
        'content-type': contentType,
        'x-upsert': 'false',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    }
  },

  /** Size and type of an object, or null when it doesn't exist. */
  async head(key) {
    const slash = key.lastIndexOf('/')
    const folder = key.slice(0, slash)
    const name = key.slice(slash + 1)
    const { data, error } = await bucket().list(folder, { limit: 10, search: name })
    if (error) return null
    const item = (data || []).find((entry) => entry.name === name)
    if (!item) return null
    return { size: Number(item.metadata?.size ?? item.metadata?.contentLength ?? 0), contentType: item.metadata?.mimetype || null }
  },

  async get(key) {
    const { data, error } = await bucket().download(key)
    if (error || !data) return null
    return Buffer.from(await data.arrayBuffer())
  },

  async put(key, body, { contentType, cacheControl = '31536000' } = {}) {
    const payload = new Uint8Array(body.length)
    payload.set(body)
    const { error } = await bucket().upload(key, payload, { contentType, cacheControl, upsert: true })
    if (error) throw new Error(`Storage write failed for ${key}: ${error.message}`)
  },

  async remove(keys) {
    for (let i = 0; i < keys.length; i += 500) {
      const { error } = await bucket().remove(keys.slice(i, i + 500))
      if (error) throw new Error(`Storage delete failed: ${error.message}`)
    }
  },

  /** Deletes every object under a prefix (recursive, paginated). */
  async removePrefix(prefix) {
    const keys = []
    const walk = async (folder) => {
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await bucket().list(folder, { limit: 100, offset })
        if (error) throw new Error(`Storage list failed: ${error.message}`)
        for (const item of data || []) {
          const path = `${folder}/${item.name}`
          if (item.id === null) await walk(path)
          else keys.push(path)
        }
        if (!data || data.length < 100) break
      }
    }
    await walk(prefix.replace(/\/$/, ''))
    if (keys.length) await this.remove(keys)
    return keys.length
  },

  /**
   * Signed GET URLs for many keys. ttl is in seconds; `download` sets an
   * attachment filename. Returns Map<key, url>.
   */
  async signGet(keys, { ttl = 7200, download } = {}) {
    const result = new Map()
    const now = Date.now()
    const missing = []
    for (const key of keys) {
      const cached = !download && signedCache.get(key)
      if (cached && cached.expires - now > (ttl * 1000) / 3) result.set(key, cached.url)
      else missing.push(key)
    }
    if (!missing.length) return result

    if (download) {
      for (const key of missing) {
        const { data } = await bucket().createSignedUrl(key, ttl, { download })
        if (data?.signedUrl) result.set(key, data.signedUrl)
      }
      return result
    }

    for (let i = 0; i < missing.length; i += 100) {
      const chunk = missing.slice(i, i + 100)
      const { data, error } = await bucket().createSignedUrls(chunk, ttl)
      if (error) throw new Error(`Could not sign media URLs: ${error.message}`)
      for (const row of data || []) {
        if (!row.signedUrl || row.error) continue
        result.set(row.path, row.signedUrl)
        signedCache.set(row.path, { url: row.signedUrl, expires: now + ttl * 1000 })
      }
    }
    if (signedCache.size > MAX_CACHE) {
      for (const [k, v] of signedCache) if (v.expires < now || signedCache.size > MAX_CACHE) signedCache.delete(k)
    }
    return result
  },
}
