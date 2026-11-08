'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

/** Top navigation built from the sections actually present on the page. */
const labelLength = (list) => list.reduce((n, item) => n + (item.label?.en || '').length, 0)

/**
 * Top navigation built from the sections actually present on the page. When the
 * events' names make the row too long (a Bengali Hindu wedding has many, with
 * long names), the desktop row groups them under one "Events" dropdown.
 */
export default function Nav({ initials = [], items = [], eventsLabel = { en: 'Events' }, overDarkHero = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const eventsRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!eventsOpen) return
    const onKey = (e) => e.key === 'Escape' && setEventsOpen(false)
    const onClick = (e) => !eventsRef.current?.contains(e.target) && setEventsOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onClick)
    }
  }, [eventsOpen])

  const transparent = overDarkHero && !scrolled && !open
  const monogram = initials.filter(Boolean).join(' & ')
  const events = items.filter((item) => item.event)
  const group = events.length > 1 && labelLength(items) > 64
  // The desktop row: the events become one dropdown entry where it is first needed
  const row = group
    ? items.flatMap((item) => (!item.event ? [item] : item === events[0] ? [{ id: '__events', label: eventsLabel, events }] : []))
    : items
  // Even grouped, a very long row only fits inline on wide screens
  const crowded = labelLength(row) > 64

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-500 ${
        transparent ? 'bg-transparent text-t-on-inverse' : 'border-b border-t-line/60 bg-t-bg/90 text-t-ink backdrop-blur-md'
      }`}
    >
      <nav aria-label="Sections" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-[max(1.25rem,env(safe-area-inset-left))]">
        <a href="#home" className="t-display shrink-0 whitespace-nowrap text-xl tracking-wide">
          {monogram}
        </a>
        <ul className={`hidden items-center gap-6 whitespace-nowrap text-[13px] uppercase tracking-[0.16em] ${crowded ? '2xl:flex' : 'lg:flex'}`}>
          {row.map((item) =>
            item.events ? (
              <li key={item.id} ref={eventsRef} className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 uppercase tracking-[0.16em] opacity-80 transition hover:opacity-100"
                  aria-expanded={eventsOpen}
                  aria-controls="site-events-menu"
                  onClick={() => setEventsOpen((o) => !o)}
                >
                  {item.label.en}
                  <ChevronDown size={14} className={`transition ${eventsOpen ? 'rotate-180' : ''}`} />
                </button>
                {eventsOpen && (
                  <ul id="site-events-menu" className="absolute left-1/2 top-full mt-4 min-w-60 -translate-x-1/2 rounded-xl border border-t-line/60 bg-t-bg py-2 text-t-ink shadow-lg">
                    {item.events.map((ev) => (
                      <li key={ev.id}>
                        <a href={`#${ev.id}`} onClick={() => setEventsOpen(false)} className="block px-5 py-2.5 opacity-80 transition hover:bg-t-line/30 hover:opacity-100">
                          {ev.label.en}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.id}>
                <a href={`#${item.id}`} className="opacity-80 transition hover:opacity-100">
                  {item.label.en}
                </a>
              </li>
            )
          )}
        </ul>
        <button type="button" className={`rounded-md p-2 ${crowded ? '2xl:hidden' : 'lg:hidden'}`} aria-expanded={open} aria-controls="site-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <ul id="site-menu" className={`max-h-[80svh] overflow-y-auto border-t border-t-line/60 bg-t-bg px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 ${crowded ? '2xl:hidden' : 'lg:hidden'}`}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={() => setOpen(false)} className="flex items-baseline justify-between border-b border-t-line/50 py-4">
                <span className="t-display text-xl">{item.label.en}</span>
                {item.label.bn && (
                  <span lang="bn" className="font-t-bn text-sm text-t-ink-muted">
                    {item.label.bn}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
