'use client'

import { useCallback } from 'react'

/**
 * Uploads one file for a site and resolves to its URL.
 * The private media pipeline replaces the transport later; callers only see
 * `upload(file, category) => url`.
 */
export function useUpload(siteId) {
  return useCallback(
    async (file, category = 'gallery') => {
      const form = new FormData()
      form.append('file', file)
      form.append('siteId', siteId)
      form.append('category', category)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.publicUrl) throw new Error(data.error || `Upload failed for ${file.name}`)
      return data.publicUrl
    },
    [siteId]
  )
}
