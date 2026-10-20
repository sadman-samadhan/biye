'use client'

import { useEffect } from 'react'

const MEDIA = 'img, video, picture, canvas, [data-media]'

/**
 * Best-effort deterrents for casual saving of wedding photos inside any
 * [data-protected] region:
 *  - no right-click / long-press "Save image" menu (Android, WhatsApp/Facebook in-app browsers)
 *  - no dragging photos out to the desktop
 *  - photos are blurred while the tab is hidden, so app-switcher thumbnails don't show them
 * iOS long-press, text selection and printing are handled in globals.css.
 * Screenshots and phone cameras can't be blocked by any website.
 */
export default function MediaGuard() {
  useEffect(() => {
    const isProtectedMedia = (target) => target instanceof Element && target.closest('[data-protected]') && target.closest(MEDIA)
    const block = (event) => {
      if (isProtectedMedia(event.target)) event.preventDefault()
    }
    const onVisibility = () => {
      document.documentElement.toggleAttribute('data-media-hidden', document.visibilityState === 'hidden')
    }
    document.addEventListener('contextmenu', block, { capture: true })
    document.addEventListener('dragstart', block, { capture: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('contextmenu', block, { capture: true })
      document.removeEventListener('dragstart', block, { capture: true })
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  return null
}
