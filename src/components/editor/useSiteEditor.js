'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CONTENT_KEYS = new Set(['hero', 'brideReveal', 'story', 'footer', 'blessing', 'sectionToggles', 'logoUrl'])

export class ConflictError extends Error {}

async function readError(res, fallback) {
  const data = await res.json().catch(() => ({}))
  const detail = data.issues?.[0] ? ` (${data.issues[0].path?.join('.')}: ${data.issues[0].message})` : ''
  return `${data.error || fallback}${detail}`
}

/**
 * Loads a site's editor payload and saves one section at a time with the
 * server's compare-and-swap version, so two editors can't silently overwrite
 * each other.
 */
export function useSiteEditor(siteId) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const versionRef = useRef(1)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch(`/api/sites/${siteId}`, { cache: 'no-store' })
    if (!res.ok) {
      setError(await readError(res, 'Could not load this site'))
      return
    }
    const payload = await res.json()
    versionRef.current = payload.version || 1
    setData(payload)
  }, [siteId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    load()
  }, [load])

  const saveContent = useCallback(
    async (section, value) => {
      const res = await fetch(`/api/sites/${siteId}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: value, expectedVersion: versionRef.current }),
      })
      if (res.status === 409) throw new ConflictError(await readError(res, 'Someone else changed this site'))
      if (!res.ok) throw new Error(await readError(res, 'Could not save'))
      const result = await res.json()
      versionRef.current = result.version
      setData((prev) => ({
        ...prev,
        version: result.version,
        ...(CONTENT_KEYS.has(section) ? { content: { ...prev.content, [section]: result.data } } : { [section]: result.data }),
      }))
      return result.data
    },
    [siteId]
  )

  const saveSettings = useCallback(
    async (patch) => {
      const res = await fetch(`/api/sites/${siteId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error(await readError(res, 'Could not save settings'))
      setData((prev) => ({ ...prev, site: { ...prev.site, ...patch } }))
    },
    [siteId]
  )

  const setMessages = useCallback((updater) => setData((prev) => ({ ...prev, messages: updater(prev.messages) })), [])

  return { data, error, reload: load, saveContent, saveSettings, setMessages }
}
