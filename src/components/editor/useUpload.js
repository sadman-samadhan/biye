'use client'

import { useCallback } from 'react'
import { prepareImage } from '@/lib/client/prepareImage'

async function errorText(res, fallback) {
  const text = await res.text().catch(() => '')
  let message = null
  try {
    message = JSON.parse(text).error
  } catch {
    // not JSON: a platform error page or timeout
  }
  return message || `${fallback} (error ${res.status}${res.status === 504 ? ', the server timed out' : ''})`
}

/**
 * Uploads one file into a site's private media library:
 *   1. ask the server for a direct-to-storage upload target
 *   2. PUT the (browser-resized) file straight to storage
 *   3. ask the server to build the resized variants
 * Resolves to the media summary: { token: "media:<id>", thumb, web, width, height, ... }.
 */
export function useUpload(siteId, { onUploaded } = {}) {
  return useCallback(
    async (file, { slot = 'gallery', album } = {}) => {
      const isVideo = file.type.startsWith('video/')
      const prepared = isVideo || slot === 'monogram' ? file : await prepareImage(file)

      const start = await fetch(`/api/sites/${siteId}/uploads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: isVideo ? 'video' : 'image',
          contentType: prepared.type,
          bytes: prepared.size,
          name: file.name,
          slot,
          album,
        }),
      })
      if (!start.ok) throw new Error(await errorText(start, `Could not start uploading ${file.name}`))
      const { mediaId, upload } = await start.json()

      const put = await fetch(upload.url, { method: upload.method, headers: upload.headers, body: prepared })
      if (!put.ok) throw new Error(`Upload of ${file.name} was interrupted. Check your connection and try again.`)

      const done = await fetch(`/api/sites/${siteId}/uploads/${mediaId}/complete`, { method: 'POST' })
      if (!done.ok) throw new Error(await errorText(done, `Could not process ${file.name}`))
      const { media } = await done.json()
      onUploaded?.(media)
      return media
    },
    [siteId, onUploaded]
  )
}
