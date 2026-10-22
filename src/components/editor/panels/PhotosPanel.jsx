'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, FolderDown } from 'lucide-react'
import { zipSync } from 'fflate'
import { Button, EmptyState, useToast } from '@/ui'
import PanelFrame from '../PanelFrame'

// Each .zip holds this many files, so a phone never has to hold the whole wedding in memory
const PER_ZIP = 40

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(bytes > 1024 ** 3 ? 0 : 1)} MB`

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Storage used, every photo with its full-size download, and "download everything" as .zip files. */
export default function PhotosPanel({ data, active }) {
  const toast = useToast()
  const siteId = data.site.id
  const [library, setLibrary] = useState(null)
  const [progress, setProgress] = useState(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/media`, { cache: 'no-store' })
    if (res.ok) setLibrary(await res.json())
    else toast.error('Could not load your photos')
  }, [siteId, toast])

  useEffect(() => {
    if (active) load()
  }, [active, load])

  async function downloadAll() {
    try {
      setProgress({ part: 0, parts: 0, done: 0, total: 0 })
      const res = await fetch(`/api/sites/${siteId}/media/download-links`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Could not prepare the download')
      const files = body.files || []
      if (!files.length) throw new Error('There are no photos to download yet')
      const parts = Math.ceil(files.length / PER_ZIP)
      const slug = data.site.slug
      for (let p = 0; p < parts; p++) {
        const batch = files.slice(p * PER_ZIP, (p + 1) * PER_ZIP)
        const entries = {}
        for (const [i, file] of batch.entries()) {
          setProgress({ part: p + 1, parts, done: p * PER_ZIP + i, total: files.length })
          const r = await fetch(file.url)
          if (!r.ok) throw new Error(`Could not download ${file.name}`)
          // Photos are already compressed: store them without recompressing
          entries[file.name] = [new Uint8Array(await r.arrayBuffer()), { level: 0 }]
        }
        saveBlob(new Blob([zipSync(entries)], { type: 'application/zip' }), parts > 1 ? `${slug}-photos-${p + 1}-of-${parts}.zip` : `${slug}-photos.zip`)
      }
      toast.success(parts > 1 ? `Saved ${files.length} files in ${parts} zip files` : `Saved ${files.length} files`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProgress(null)
    }
  }

  const usage = library?.usage
  const percent = usage?.quotaBytes ? Math.min(100, Math.round((usage.bytes / usage.quotaBytes) * 100)) : 0
  const media = (library?.media || []).filter((m) => m.slot !== 'monogram')

  return (
    <PanelFrame
      title="Your photos"
      description="Everything you have uploaded, in full size. Guests only ever see smaller copies."
      actions={
        <Button size="sm" icon={FolderDown} onClick={downloadAll} loading={Boolean(progress)} disabled={!media.length}>
          {progress?.parts ? `Part ${progress.part} of ${progress.parts} · ${progress.done}/${progress.total}` : 'Download all'}
        </Button>
      }
    >
      {usage && (
        <div className="space-y-2 rounded-xl bg-sb-paper p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-sb-ink">
              {usage.photos} of {usage.photoLimit} photos
            </span>
            <span className="text-sb-muted">
              {mb(usage.bytes)} of {mb(usage.quotaBytes)} used
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sb-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used">
            <div className={`h-full rounded-full ${percent > 90 ? 'bg-sb-alta' : 'bg-sb-marigold'}`} style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-sb-muted">Downloads come in zip files of {PER_ZIP}. On a phone, keep this page open until they finish.</p>
        </div>
      )}

      {library && media.length === 0 && <EmptyState title="No photos yet">Photos you add to the opening, story, ceremonies and gallery appear here.</EmptyState>}

      {media.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {media.map((m) => (
            <li key={m.id} className="group relative aspect-square overflow-hidden rounded-lg bg-sb-paper">
              {m.thumb &&
                (m.kind === 'video' ? (
                  <video src={m.thumb} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- signed storage thumbnails
                  <img src={m.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                ))}
              <a
                href={`/api/sites/${siteId}/media/${m.id}/download`}
                aria-label="Download full size"
                className="absolute bottom-1.5 right-1.5 rounded-full bg-white/90 p-1.5 text-sb-ink shadow opacity-90 transition hover:bg-white group-hover:opacity-100"
              >
                <Download size={14} />
              </a>
              {m.isPublic && <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-sb-ink">Public</span>}
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  )
}
