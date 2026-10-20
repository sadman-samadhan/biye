'use client'

import { useId, useState } from 'react'
import { ImagePlus, Crop, Trash2, Video } from 'lucide-react'
import { Button, useToast } from '@/ui'
import FocalPointPicker from '@/components/admin/FocalPointPicker'
import { getImagePath, getVideoPath } from '@/lib/media'

/**
 * One image (or video) slot with upload, preview, focal-point crop and remove.
 * value: url string; position: "x% y%" focal point.
 */
export default function MediaField({
  label,
  hint,
  value,
  position = '50% 50%',
  onChange,
  onPositionChange,
  upload,
  category,
  accept = 'image/jpeg,image/png,image/webp',
  kind = 'image',
  aspect = 'aspect-[16/10]',
  ratio = 1.6,
  aspectLabel = '16:10 frame',
}) {
  const inputId = useId()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const src = kind === 'video' ? getVideoPath(value) : getImagePath(value)

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      onChange(await upload(file, category))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-sb-ink">{label}</span>
        <div className="flex gap-1.5">
          {value && kind === 'image' && onPositionChange && (
            <Button size="sm" variant="ghost" icon={Crop} onClick={() => setCropOpen((o) => !o)} aria-expanded={cropOpen}>
              {cropOpen ? 'Done' : 'Adjust crop'}
            </Button>
          )}
          {value && (
            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onChange('')} aria-label={`Remove ${label}`}>
              Remove
            </Button>
          )}
        </div>
      </div>

      {cropOpen && value ? (
        <FocalPointPicker
          value={position}
          onChange={onPositionChange}
          imageUrl={value}
          aspectRatio={aspect}
          targetRatioNumber={ratio}
          aspectLabel={aspectLabel}
          label={label}
        />
      ) : value ? (
        <div className={`relative overflow-hidden rounded-xl border border-sb-line bg-sb-soft ${aspect} max-h-72`}>
          {kind === 'video' ? (
            <video src={src} className="h-full w-full object-cover" muted playsInline controls preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- editor preview of arbitrary storage URLs
            <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: position }} />
          )}
          <label
            htmlFor={inputId}
            className="absolute bottom-2 right-2 cursor-pointer rounded-md bg-sb-ink/80 px-2.5 py-1 text-xs font-medium text-white hover:bg-sb-ink"
          >
            {busy ? 'Uploading…' : 'Replace'}
          </label>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`flex ${aspect} max-h-56 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sb-line-strong bg-sb-paper text-sm text-sb-muted transition hover:border-sb-marigold hover:text-sb-ink`}
        >
          {kind === 'video' ? <Video size={22} /> : <ImagePlus size={22} />}
          {busy ? 'Uploading…' : `Upload ${kind === 'video' ? 'a video' : 'a photo'}`}
        </label>
      )}
      <input id={inputId} type="file" accept={accept} className="sr-only" onChange={onFile} disabled={busy} />
      {hint && <p className="mt-1 text-xs text-sb-muted">{hint}</p>}
    </div>
  )
}
