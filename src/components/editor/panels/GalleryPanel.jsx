'use client'

import { useId, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react'
import { Button, EmptyState, useToast } from '@/ui'
import { useMediaUrls } from '../media-context'
import PanelFrame from '../PanelFrame'
import { usePanelDraft } from '../usePanelDraft'

const MAX_PHOTOS = 300

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function GalleryPanel({ data, saveContent, upload, onDirtyChange }) {
  const toast = useToast()
  const { resolve } = useMediaUrls()
  const inputId = useId()
  const { draft, setDraft, dirty, reset, commit } = usePanelDraft(data.gallery || [], onDirtyChange)
  const [progress, setProgress] = useState(null)

  const albums = [
    { value: 'wedding', label: 'Wedding' },
    ...(data.ceremonies || []).map((c) => ({ value: c.id, label: c.title?.en || c.id })),
  ].filter((a, i, list) => list.findIndex((b) => b.value === a.value) === i)
  const [album, setAlbum] = useState(albums[0]?.value || 'wedding')

  async function onFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - draft.length)
    e.target.value = ''
    if (!files.length) return
    const added = []
    for (let i = 0; i < files.length; i++) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`)
      try {
        const media = await upload(files[i], { slot: 'gallery', album })
        added.push({ filename: media.token, category: album, alt: '' })
      } catch (err) {
        toast.error(err.message)
      }
    }
    setProgress(null)
    setDraft((list) => [...list, ...added])
    if (added.length) toast.info(`${added.length} photo${added.length > 1 ? 's' : ''} added. Save to publish them.`)
  }

  const set = (i, patch) => setDraft(draft.map((img, j) => (j === i ? { ...img, ...patch } : img)))

  async function save() {
    await saveContent('gallery', draft)
    commit(draft)
  }

  return (
    <PanelFrame
      title="Gallery"
      description={`Photos for the gallery, grouped into albums by ceremony. ${draft.length} / ${MAX_PHOTOS}.`}
      dirty={dirty}
      onSave={save}
      onDiscard={reset}
    >
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-sb-paper p-4">
        <label className="min-w-40 flex-1 text-sm">
          <span className="mb-1.5 block font-medium text-sb-ink">Add to album</span>
          <select value={album} onChange={(e) => setAlbum(e.target.value)} className="w-full rounded-lg border border-sb-line-strong bg-sb-card px-3 py-2.5">
            {albums.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor={inputId}
          className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-sb-ink px-4 text-sm font-medium text-sb-paper hover:bg-sb-ink-soft ${progress ? 'pointer-events-none opacity-60' : ''}`}
        >
          <ImagePlus size={16} /> {progress || 'Upload photos'}
        </label>
        <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={onFiles} disabled={Boolean(progress)} />
      </div>

      {draft.length === 0 ? (
        <EmptyState title="No photos yet">Upload photos from each ceremony; you can reorder them and change albums afterwards.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {draft.map((img, i) => (
            <li key={`${img.filename}-${i}`} className="overflow-hidden rounded-xl border border-sb-line bg-sb-card">
              <div className="relative aspect-[4/5] bg-sb-soft">
                {/* eslint-disable-next-line @next/next/no-img-element -- editor thumbnails of storage URLs */}
                <img src={resolve(img.filename, 'thumb')} alt={img.alt || ''} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded bg-sb-ink/75 px-1.5 py-0.5 text-[11px] font-medium text-white">{i + 1}</span>
              </div>
              <div className="space-y-2 p-2">
                <select
                  aria-label="Album"
                  value={img.category || 'wedding'}
                  onChange={(e) => set(i, { category: e.target.value })}
                  className="w-full rounded-md border border-sb-line px-2 py-1 text-xs"
                >
                  {albums.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Caption"
                  placeholder="Caption (optional)"
                  value={img.alt || ''}
                  maxLength={200}
                  onChange={(e) => set(i, { alt: e.target.value })}
                  className="w-full rounded-md border border-sb-line px-2 py-1 text-xs"
                />
                <div className="flex justify-between">
                  <div className="flex">
                    <Button size="sm" variant="ghost" icon={ArrowLeft} aria-label="Move earlier" disabled={i === 0} onClick={() => setDraft(move(draft, i, i - 1))} />
                    <Button size="sm" variant="ghost" icon={ArrowRight} aria-label="Move later" disabled={i === draft.length - 1} onClick={() => setDraft(move(draft, i, i + 1))} />
                  </div>
                  <Button size="sm" variant="ghost" icon={Trash2} aria-label="Remove photo" onClick={() => setDraft(draft.filter((_, j) => j !== i))} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  )
}
