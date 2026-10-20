/**
 * Content stores private media as "media:<uuid>" tokens (instead of URLs) so
 * nothing in the database is a usable link on its own. Pure helpers, safe for
 * client and server.
 */
export const MEDIA_TOKEN = /^media:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/

export const toMediaToken = (id) => `media:${id}`

export function mediaIdOf(value) {
  if (typeof value !== 'string') return null
  return value.match(MEDIA_TOKEN)?.[1] ?? null
}

/** Every media id referenced anywhere inside a JSON value. */
export function collectMediaIds(value, found = new Set()) {
  if (typeof value === 'string') {
    const id = mediaIdOf(value)
    if (id) found.add(id)
  } else if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, found)
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectMediaIds(item, found)
  }
  return found
}

/** Deep-maps a JSON value, replacing media tokens via `replace(id, value, parent)`. */
export function mapMediaTokens(value, replace) {
  if (typeof value === 'string') {
    const id = mediaIdOf(value)
    return id ? replace(id, value) : value
  }
  if (Array.isArray(value)) return value.map((item) => mapMediaTokens(item, replace))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = mapMediaTokens(v, replace)
    return out
  }
  return value
}
