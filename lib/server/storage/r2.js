import 'server-only'
import { AwsClient } from 'aws4fetch'
import { flooredAmzDate, presignR2 } from './r2-sign.js'

/**
 * Cloudflare R2 driver (S3 API). Zero egress fees; 10 GB free.
 * Enabled with STORAGE_DRIVER=r2 and R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, R2_BUCKET. The bucket must be private with a CORS rule
 * allowing PUT from the app's origins.
 */

let client = null
function r2() {
  client ??= new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  })
  return client
}

const base = () => `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`
const objectUrl = (key) => `${base()}/${key.split('/').map(encodeURIComponent).join('/')}`
const presign = (key, opts) => presignR2(r2(), objectUrl(key), opts)

export const r2Driver = {
  name: 'r2',

  async createUploadTarget({ key, contentType }) {
    const url = await presign(key, { method: 'PUT', ttl: 900, headers: { 'content-type': contentType } })
    return { method: 'PUT', url, headers: { 'content-type': contentType } }
  },

  async head(key) {
    const res = await r2().fetch(objectUrl(key), { method: 'HEAD' })
    if (!res.ok) return null
    return { size: Number(res.headers.get('content-length') || 0), contentType: res.headers.get('content-type') }
  },

  async get(key) {
    const res = await r2().fetch(objectUrl(key))
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  },

  async put(key, body, { contentType, cacheControl = 'private, max-age=31536000, immutable' } = {}) {
    const res = await r2().fetch(objectUrl(key), {
      method: 'PUT',
      body,
      headers: { 'content-type': contentType, 'cache-control': cacheControl },
    })
    if (!res.ok) throw new Error(`R2 write failed for ${key}: ${res.status}`)
  },

  async remove(keys) {
    // DeleteObjects needs Content-MD5; individual deletes keep this dependency-free.
    for (let i = 0; i < keys.length; i += 20) {
      await Promise.all(
        keys.slice(i, i + 20).map(async (key) => {
          const res = await r2().fetch(objectUrl(key), { method: 'DELETE' })
          if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed for ${key}: ${res.status}`)
        })
      )
    }
  },

  async removePrefix(prefix) {
    const keys = []
    let token
    do {
      const url = new URL(base())
      url.searchParams.set('list-type', '2')
      url.searchParams.set('prefix', prefix)
      if (token) url.searchParams.set('continuation-token', token)
      const res = await r2().fetch(url.toString())
      if (!res.ok) throw new Error(`R2 list failed: ${res.status}`)
      const xml = await res.text()
      for (const match of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) keys.push(match[1].replace(/&amp;/g, '&'))
      token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? xml.match(/<NextContinuationToken>([^<]+)</)?.[1] : null
    } while (token)
    if (keys.length) await this.remove(keys)
    return keys.length
  },

  async signGet(keys, { ttl = 7200, download } = {}) {
    const datetime = download ? undefined : flooredAmzDate()
    // Flooring can eat up to an hour, so sign for an extra hour to keep at least `ttl` left.
    const effectiveTtl = download ? ttl : ttl + 3600
    const query = download ? { 'response-content-disposition': `attachment; filename="${download.replace(/"/g, '')}"` } : {}
    const result = new Map()
    await Promise.all(keys.map(async (key) => result.set(key, await presign(key, { ttl: effectiveTtl, datetime, query }))))
    return result
  },
}
