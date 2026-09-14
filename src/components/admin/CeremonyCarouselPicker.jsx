'use client'

import React, { useState } from 'react'
import { Upload, Trash2, Crop, Loader2, Plus, CheckCircle, Image as ImageIcon } from 'lucide-react'
import FocalPointPicker from './FocalPointPicker'

/**
 * Manages up to 5 carousel photos for a ceremony section with live crop preview and focal point selection.
 */
export default function CeremonyCarouselPicker({
  images = [],
  onChange,
  onUpload,
  maxImages = 5,
  label = 'Ceremony Moments Carousel'
}) {
  const [uploading, setUploading] = useState(false)
  const [selectedCropIndex, setSelectedCropIndex] = useState(null)

  // Normalize images to array of objects: { url, position }
  const normalizedImages = (images || []).map(item => {
    if (typeof item === 'string') {
      return { url: item, position: '50% 50%' }
    }
    return { url: item?.url || item?.filename || '', position: item?.position || '50% 50%' }
  }).filter(item => Boolean(item.url))

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = maxImages - normalizedImages.length
    if (remainingSlots <= 0) {
      alert(`Maximum limit of ${maxImages} carousel photos reached.`)
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    setUploading(true)

    try {
      const newItems = []
      for (const file of filesToUpload) {
        const publicUrl = await onUpload(file)
        if (publicUrl) {
          newItems.push({ url: publicUrl, position: '50% 50%' })
        }
      }
      onChange([...normalizedImages, ...newItems])
    } catch (err) {
      console.error('Failed to upload carousel photos:', err)
      alert('Photo upload failed: ' + err.message)
    } finally {
      setUploading(false)
      // reset file input
      e.target.value = ''
    }
  }

  const handleRemove = (removeIndex) => {
    const updated = normalizedImages.filter((_, idx) => idx !== removeIndex)
    if (selectedCropIndex === removeIndex) {
      setSelectedCropIndex(null)
    } else if (selectedCropIndex > removeIndex) {
      setSelectedCropIndex(selectedCropIndex - 1)
    }
    onChange(updated)
  }

  const handleUpdatePosition = (index, newPos) => {
    const updated = [...normalizedImages]
    updated[index] = { ...updated[index], position: newPos }
    onChange(updated)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
            <span>{label}</span>
            <span className="text-[11px] text-[#D4A574] font-normal">
              ({normalizedImages.length} / {maxImages} photos)
            </span>
          </label>
          <p className="text-[11px] text-zinc-400 font-light mt-0.5">
            Cinematic photo carousel rendered on public website with customizable crop and framing
          </p>
        </div>

        {normalizedImages.length < maxImages && (
          <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border border-white/10 shrink-0">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} className="text-[#D4A574]" />}
            <span>{uploading ? 'Uploading...' : 'Add Photos'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleFiles}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Grid of uploaded carousel photos */}
      {normalizedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {normalizedImages.map((img, idx) => {
            const isCropping = selectedCropIndex === idx
            return (
              <div
                key={idx}
                className={`relative rounded-xl overflow-hidden border transition-all ${
                  isCropping
                    ? 'border-[#D4A574] ring-2 ring-[#D4A574]/40 shadow-lg'
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                {/* Thumbnail with custom crop position */}
                <div className="relative aspect-[4/3] w-full bg-black/60 overflow-hidden">
                  <img
                    src={img.url}
                    alt={`Carousel item ${idx + 1}`}
                    style={{ objectPosition: img.position || '50% 50%' }}
                    className="w-full h-full object-cover"
                  />

                  {/* Top badges */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono font-bold text-[#D4A574]">
                    #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-900/80 text-zinc-400 hover:text-rose-200 transition-colors"
                    title="Remove from carousel"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Bottom Crop Button */}
                <div className="p-1.5 bg-black/60 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCropIndex(isCropping ? null : idx)}
                    className={`w-full py-1 px-1.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors ${
                      isCropping
                        ? 'bg-[#D4A574] text-black font-semibold'
                        : 'bg-white/10 hover:bg-white/15 text-zinc-200'
                    }`}
                  >
                    <Crop size={11} />
                    <span>{isCropping ? 'Editing Crop' : 'Crop / Frame'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Interactive Crop / Viewfinder for the selected carousel image */}
      {selectedCropIndex !== null && normalizedImages[selectedCropIndex] && (
        <div className="p-4 rounded-xl bg-black/50 border border-[#D4A574]/40 space-y-3 mt-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-medium text-white flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#D4A574]/20 text-[#D4A574] font-mono text-[11px]">
                Photo #{selectedCropIndex + 1} of {normalizedImages.length}
              </span>
              <span>Crop &amp; Viewfinder Adjustment</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedCropIndex(null)}
              className="px-2.5 py-1 rounded bg-[#D4A574] text-black text-xs font-semibold hover:brightness-110"
            >
              Done Framing
            </button>
          </div>

          <FocalPointPicker
            value={normalizedImages[selectedCropIndex].position || '50% 50%'}
            onChange={(newPos) => handleUpdatePosition(selectedCropIndex, newPos)}
            imageUrl={normalizedImages[selectedCropIndex].url}
            aspectRatio="aspect-[4/3]"
            targetRatioNumber={1.33}
            label={`Carousel Photo #${selectedCropIndex + 1} Preview`}
            aspectLabel="4:3 Carousel Frame"
          />
        </div>
      )}
    </div>
  )
}
