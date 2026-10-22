'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

/** Top navigation built from the sections actually present on the page. */
export default function Nav({ initials = [], items = [], overDarkHero = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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

  const transparent = overDarkHero && !scrolled && !open
  const monogram = initials.filter(Boolean).join(' & ')
  // Long menus (e.g. a Bengali Hindu wedding's many events) only fit inline on wide screens
  const crowded = items.reduce((n, item) => n + (item.label?.en || '').length, 0) > 80

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-500 ${
        transparent ? 'bg-transparent text-t-on-inverse' : 'border-b border-t-line/60 bg-t-bg/90 text-t-ink backdrop-blur-md'
      }`}
    >
      <nav aria-label="Sections" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-[max(1.25rem,env(safe-area-inset-left))]">
        <a href="#home" className="t-display shrink-0 whitespace-nowrap text-xl tracking-wide">
          {monogram}
        </a>
        <ul className={`hidden items-center gap-6 whitespace-nowrap text-[13px] uppercase tracking-[0.16em] ${crowded ? '2xl:flex' : 'lg:flex'}`}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="opacity-80 transition hover:opacity-100">
                {item.label.en}
              </a>
            </li>
          ))}
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
