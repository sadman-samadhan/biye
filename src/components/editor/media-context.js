'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { mediaIdOf } from '@/lib/media-ref'
import { getImagePath, getVideoPath } from '@/lib/media'

const MediaUrlContext = createContext({ resolve: (v) => getImagePath(v), register: () => {} })

/**
 * Content stores "media:<id>" tokens; the editor needs real (signed) URLs to
 * preview them. Seeded from the editor payload and extended after each upload.
 */
export function useMediaUrlState(initial) {
  const [urls, setUrls] = useState(initial || {})

  const register = useCallback((media) => {
    if (!media?.id) return
    setUrls((prev) => ({ ...prev, [media.id]: { web: media.web, thumb: media.thumb, video: media.kind === 'video' ? media.web : undefined, width: media.width, height: media.height } }))
  }, [])

  const resolve = useCallback(
    (value, size = 'web') => {
      const id = mediaIdOf(value)
      if (!id) return value ? (/\.(mp4|webm)$/i.test(value) ? getVideoPath(value) : getImagePath(value)) : ''
      const entry = urls[id]
      return entry?.[size] || entry?.web || entry?.video || ''
    },
    [urls]
  )

  return useMemo(() => ({ resolve, register }), [resolve, register])
}

export const MediaUrlProvider = MediaUrlContext.Provider

export function useMediaUrls() {
  return useContext(MediaUrlContext)
}
