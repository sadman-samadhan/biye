'use client'

import { useMemo, useState } from 'react'
import Photo from '../primitives/Photo'
import Lightbox from '../primitives/Lightbox'
import { Bilingual } from '../primitives/text'
import { ArchOutline } from '@/themes/ornaments'

const PAGE = 24

export default function Gallery({ variant, items = [], albums = [], copy, viewerName, mask }) {
  const [album, setAlbum] = useState('all')
  const [visible, setVisible] = useState(PAGE)
  const [open, setOpen] = useState(null)

  const usedAlbums = useMemo(() => albums.filter((a) => items.some((i) => i.category === a.id)), [albums, items])
  const filtered = useMemo(() => (album === 'all' ? items : items.filter((i) => i.category === album)), [items, album])
  const shown = filtered.slice(0, visible)
  if (!items.length) return null

  const archGrid = variant === 'arch-grid'

  return (
    <section id="gallery" className="bg-t-bg py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="mb-12 text-center">
          <Bilingual value={copy['gallery.title']} as="h2" enClassName="t-display text-4xl md:text-6xl" bnClassName="mt-2 font-t-bn-display text-2xl text-t-ink-muted" />
        </header>

        {usedAlbums.length > 1 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Albums">
            {[{ id: 'all', label: copy['gallery.all'] }, ...usedAlbums].map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={album === a.id}
                onClick={() => {
                  setAlbum(a.id)
                  setVisible(PAGE)
                }}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${album === a.id ? 'border-t-accent bg-t-accent text-t-on-accent' : 'border-t-line text-t-ink-muted hover:border-t-accent hover:text-t-ink'}`}
              >
                {a.label.en}
                {a.label.bn && (
                  <span lang="bn" className="ml-1.5 font-t-bn opacity-80">
                    {a.label.bn}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {archGrid ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
            {shown.map((item, i) => (
              <li key={item.id || item.src}>
                <button type="button" onClick={() => setOpen(i)} className="group relative block aspect-[3/4] w-full text-t-ornament" aria-label={`Open photo ${i + 1}`}>
                  <Photo src={item.src} thumb={item.thumb} alt={item.alt || ''} lqip={item.lqip} mask={mask} sizes="(min-width: 640px) 33vw, 50vw" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  {mask === 'arch' && <ArchOutline className="opacity-70" />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="columns-2 gap-3 md:columns-3 md:gap-5">
            {shown.map((item, i) => (
              <li key={item.id || item.src} className="mb-3 break-inside-avoid md:mb-5">
                <button type="button" onClick={() => setOpen(i)} className="group block w-full overflow-hidden rounded-[var(--t-radius)] bg-t-bg-alt" aria-label={`Open photo ${i + 1}`}>
                  <Photo
                    src={item.src}
                    thumb={item.thumb}
                    alt={item.alt || ''}
                    lqip={item.lqip}
                    width={item.width}
                    height={item.height}
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {filtered.length > visible && (
          <div className="mt-12 text-center">
            <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="rounded-full border border-t-ink/30 px-6 py-3 text-sm uppercase tracking-[0.2em] hover:bg-t-ink hover:text-t-bg">
              {copy['gallery.more'].en} ({filtered.length - visible})
            </button>
          </div>
        )}
      </div>

      {open != null && (
        <Lightbox
          items={shown.map((i) => ({ src: i.src, alt: i.alt, caption: i.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          viewerName={viewerName}
          sharedWithLabel={copy['gallery.sharedWith'].en}
        />
      )}
    </section>
  )
}
