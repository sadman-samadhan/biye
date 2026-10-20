'use client'

import { useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/**
 * Full-screen photo viewer: arrow keys / swipe to move, Esc to close, focus
 * kept inside. A transparent shield sits over the photo so long-press and
 * right-click hit it instead of the image, and a faint "Shared with <guest>"
 * label appears when the guest gave their name at the passcode gate.
 */
/** Keeps Tab and Shift+Tab cycling through the viewer's visible buttons. */
function trapFocus(e, dialog) {
  const buttons = [...(dialog?.querySelectorAll('button') || [])].filter((b) => b.offsetParent !== null)
  if (!buttons.length) return
  const first = buttons[0]
  const last = buttons[buttons.length - 1]
  const active = document.activeElement
  if (e.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
    e.preventDefault()
    first.focus()
  }
}

export default function Lightbox({ items, index, onIndex, onClose, sharedWithLabel, viewerName }) {
  const dialogRef = useRef(null)
  const touch = useRef(null)
  const item = items[index]
  const count = items.length

  const go = useCallback((delta) => onIndex((index + delta + count) % count), [index, count, onIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'Tab') trapFocus(e, dialogRef.current)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Focus the viewer while it is open and give focus back to the photo that opened it
  useEffect(() => {
    const previous = document.activeElement
    dialogRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [])

  // Preload neighbours for instant next/previous
  useEffect(() => {
    for (const d of [1, -1]) {
      const next = items[(index + d + count) % count]
      if (next?.src) {
        const img = new Image()
        img.src = next.src
      }
    }
  }, [index, items, count])

  if (!item) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt || 'Photo'}
      tabIndex={-1}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 outline-none"
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white">
        <X size={26} />
      </button>
      {count > 1 && (
        <>
          <button type="button" onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Previous photo" className="absolute left-2 z-10 hidden rounded-full p-3 text-white/70 hover:bg-white/10 hover:text-white sm:block">
            <ChevronLeft size={30} />
          </button>
          <button type="button" onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Next photo" className="absolute right-2 z-10 hidden rounded-full p-3 text-white/70 hover:bg-white/10 hover:text-white sm:block">
            <ChevronRight size={30} />
          </button>
        </>
      )}

      <figure className="relative mx-4 flex max-h-[92svh] flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- private signed URL */}
          <img src={item.src} alt={item.alt || ''} draggable={false} data-media className="max-h-[82svh] w-auto max-w-full object-contain" />
          <div aria-hidden="true" data-media className="absolute inset-0" />
          {viewerName && (
            <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 select-none rounded bg-black/30 px-2 py-1 text-[11px] tracking-wide text-white/75">
              {sharedWithLabel} {viewerName}
            </span>
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-white/75">
          {item.caption || item.alt}
          {count > 1 && <span className="ml-2 tabular-nums text-white/45">{index + 1} / {count}</span>}
        </figcaption>
      </figure>
    </div>
  )
}
