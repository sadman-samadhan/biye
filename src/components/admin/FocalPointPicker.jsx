'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Move, RotateCcw, Sliders, Eye, Crop, Check } from 'lucide-react'

/**
 * Parse CSS object-position string into { x, y } percentages.
 */
export function parseFocalPoint(posStr) {
  if (!posStr || posStr === 'center') return { x: 50, y: 50 }
  if (posStr === 'top') return { x: 50, y: 0 }
  if (posStr === 'bottom') return { x: 50, y: 100 }

  const parts = String(posStr).trim().split(/\s+/)
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10)
    if (!isNaN(num)) return { x: 50, y: Math.min(100, Math.max(0, num)) }
    return { x: 50, y: 50 }
  }

  let x = 50
  let y = 50

  if (parts[0] === 'center') x = 50
  else if (parts[0] === 'left') x = 0
  else if (parts[0] === 'right') x = 100
  else {
    const numX = parseInt(parts[0], 10)
    if (!isNaN(numX)) x = numX
  }

  if (parts[1] === 'center') y = 50
  else if (parts[1] === 'top') y = 0
  else if (parts[1] === 'bottom') y = 100
  else {
    const numY = parseInt(parts[1], 10)
    if (!isNaN(numY)) y = numY
  }

  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y))
  }
}

/**
 * Visual Viewfinder Crop Rectangle & Focal Point Picker for AmarBiye
 */
export default function FocalPointPicker({
  value = '50% 50%',
  onChange,
  imageUrl,
  isVideo = false,
  videoUrl = '',
  fileName = '',
  aspectRatio = 'aspect-[16/10]',
  targetRatioNumber = 1.6,
  label = 'Current Media Preview',
  aspectLabel = '16:10 Frame'
}) {
  const viewfinderRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('crop') // 'crop' | 'preview'
  const [imgDim, setImgDim] = useState({ width: 0, height: 0, loaded: false })

  const coords = parseFocalPoint(value)

  // Measure natural image dimensions
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalWidth && naturalHeight) {
      setImgDim({ width: naturalWidth, height: naturalHeight, loaded: true })
    }
  }

  // Calculate the 16:10 crop frame dimensions relative to the full image
  const imgRatio = imgDim.loaded && imgDim.height > 0 ? imgDim.width / imgDim.height : 0.8
  const isTaller = imgRatio < targetRatioNumber

  let frameWidthPercent = 100
  let frameHeightPercent = 100

  if (isTaller) {
    // Image is taller than 16:10 (standard portrait)
    frameWidthPercent = 100
    frameHeightPercent = Math.min(100, Math.max(15, (imgRatio / targetRatioNumber) * 100))
  } else {
    // Image is wider than 16:10 (horizontal panorama)
    frameHeightPercent = 100
    frameWidthPercent = Math.min(100, Math.max(15, (targetRatioNumber / imgRatio) * 100))
  }

  // Calculate top & left percentages of the crop frame
  const maxTopPercent = 100 - frameHeightPercent
  const maxLeftPercent = 100 - frameWidthPercent

  const frameTopPercent = (coords.y / 100) * maxTopPercent
  const frameLeftPercent = (coords.x / 100) * maxLeftPercent

  // Handle pointer drag on the viewfinder
  const updateCropPosition = useCallback((clientY, clientX) => {
    if (!viewfinderRef.current) return
    const rect = viewfinderRef.current.getBoundingClientRect()

    if (isTaller) {
      // Dragging vertically
      const relativeY = clientY - rect.top
      const frameHeightPx = (frameHeightPercent / 100) * rect.height
      // Center the frame on the cursor or clamp
      const targetTopPx = relativeY - (frameHeightPx / 2)
      const maxTopPx = rect.height - frameHeightPx

      const ratio = maxTopPx > 0 ? Math.min(1, Math.max(0, targetTopPx / maxTopPx)) : 0.5
      const newY = Math.round(ratio * 100)
      onChange(`${coords.x}% ${newY}%`)
    } else {
      // Dragging horizontally
      const relativeX = clientX - rect.left
      const frameWidthPx = (frameWidthPercent / 100) * rect.width
      const targetLeftPx = relativeX - (frameWidthPx / 2)
      const maxLeftPx = rect.width - frameWidthPx

      const ratio = maxLeftPx > 0 ? Math.min(1, Math.max(0, targetLeftPx / maxLeftPx)) : 0.5
      const newX = Math.round(ratio * 100)
      onChange(`${newX}% ${coords.y}%`)
    }
  }, [coords.x, coords.y, frameHeightPercent, frameWidthPercent, isTaller, onChange])

  const handlePointerDown = (e) => {
    setIsDragging(true)
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    updateCropPosition(clientY, clientX)
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      updateCropPosition(clientY, clientX)
    }

    const handlePointerUp = () => {
      if (isDragging) setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove)
      window.addEventListener('touchend', handlePointerUp)
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, updateCropPosition])

  const currentCssPosition = `${coords.x}% ${coords.y}%`

  const src = imageUrl?.startsWith('http') || imageUrl?.startsWith('blob:') || imageUrl?.startsWith('/')
    ? imageUrl
    : imageUrl ? `/images/${imageUrl}` : ''

  return (
    <div className="space-y-4">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'crop'
                ? 'bg-[#A67C52] text-white shadow-sm'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Crop size={13} />
            <span>Crop Rectangle View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#A67C52] text-white shadow-sm'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>Final Cropped Preview</span>
          </button>
        </div>

        <span className="text-zinc-400 font-mono text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
          Position: <strong className="text-[#D4A574]">{coords.y}%</strong>
        </span>
      </div>

      {/* 1. CROP RECTANGLE VIEW (Full photo with movable 16:10 rectangle) */}
      {activeTab === 'crop' && (
        <div className="space-y-3">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Drag the golden rectangle to choose what is framed:</span>
            <span className="text-[#D4A574]">{aspectLabel}</span>
          </div>

          <div
            ref={viewfinderRef}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            className="relative max-h-[380px] w-full rounded-2xl overflow-hidden border-2 border-white/10 bg-black/80 flex items-center justify-center cursor-grab active:cursor-grabbing select-none group shadow-xl"
          >
            {src ? (
              <div className="relative inline-block max-w-full max-h-[380px]">
                {/* Full Uncropped Photo */}
                <img
                  src={src}
                  alt="Full Source"
                  onLoad={onImageLoad}
                  className="max-h-[380px] w-auto max-w-full object-contain block pointer-events-none"
                />

                {/* Dark Mask Outside the Rectangle */}
                {/* Top Mask */}
                <div
                  className="absolute left-0 right-0 top-0 bg-black/65 backdrop-blur-[1px] pointer-events-none transition-all duration-75"
                  style={{ height: `${frameTopPercent}%` }}
                />

                {/* Bottom Mask */}
                <div
                  className="absolute left-0 right-0 bottom-0 bg-black/65 backdrop-blur-[1px] pointer-events-none transition-all duration-75"
                  style={{ height: `${100 - (frameTopPercent + frameHeightPercent)}%` }}
                />

                {/* Left Mask */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/65 backdrop-blur-[1px] pointer-events-none transition-all duration-75"
                  style={{
                    top: `${frameTopPercent}%`,
                    height: `${frameHeightPercent}%`,
                    width: `${frameLeftPercent}%`
                  }}
                />

                {/* Right Mask */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/65 backdrop-blur-[1px] pointer-events-none transition-all duration-75"
                  style={{
                    top: `${frameTopPercent}%`,
                    height: `${frameHeightPercent}%`,
                    width: `${100 - (frameLeftPercent + frameWidthPercent)}%`
                  }}
                />

                {/* The Golden 16:10 Frame */}
                <div
                  className="absolute border-2 border-[#D4A574] shadow-[0_0_20px_rgba(212,165,116,0.6)] transition-all duration-75 pointer-events-none flex flex-col justify-between p-1.5"
                  style={{
                    top: `${frameTopPercent}%`,
                    left: `${frameLeftPercent}%`,
                    width: `${frameWidthPercent}%`,
                    height: `${frameHeightPercent}%`
                  }}
                >
                  {/* Subtle Grid / Rule of Thirds */}
                  <div className="absolute inset-0 grid grid-rows-3 grid-cols-3 pointer-events-none opacity-25">
                    <div className="border-b border-r border-[#D4A574]" />
                    <div className="border-b border-r border-[#D4A574]" />
                    <div className="border-b border-[#D4A574]" />
                    <div className="border-b border-r border-[#D4A574]" />
                    <div className="border-b border-r border-[#D4A574]" />
                    <div className="border-b border-[#D4A574]" />
                    <div className="border-r border-[#D4A574]" />
                    <div className="border-r border-[#D4A574]" />
                    <div />
                  </div>

                  {/* Top Bar with Badge */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/75 text-[#D4A574] border border-[#A67C52]/50 shadow">
                      Framed Area ({coords.y}%)
                    </span>
                    <div className="flex items-center gap-1 bg-black/75 px-1.5 py-0.5 rounded text-[10px] text-white/80">
                      <Move size={10} className="text-[#D4A574]" />
                      <span>Drag to Move</span>
                    </div>
                  </div>

                  {/* Corner Accent Grips */}
                  <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-[#D4A574] ml-auto relative z-10" />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 text-xs">
                No photo selected
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FINAL BANNER PREVIEW (Showing the cropped 16:10 result) */}
      {activeTab === 'preview' && (
        <div className="space-y-2">
          <div className="text-[11px] text-zinc-400">
            Live preview of how this photo appears to guests on the website:
          </div>

          <div className={`relative ${aspectRatio} rounded-2xl overflow-hidden border-2 border-[#A67C52]/50 bg-black shadow-2xl`}>
            {isVideo && videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{ objectPosition: currentCssPosition }}
                className="w-full h-full object-cover transition-all duration-100"
              />
            ) : src ? (
              <img
                src={src}
                alt="Framed Preview"
                style={{ objectPosition: currentCssPosition }}
                className="w-full h-full object-cover transition-all duration-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                No photo set
              </div>
            )}

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
              <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                {fileName || (src ? src.split('/').pop() : 'Photo Preview')}
              </span>
              <span className="text-[#D4A574] bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                {aspectLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Range Slider for Pixel-Level Adjustments */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-medium">Vertical Framing Position</span>
          <span className="text-[#D4A574] font-mono font-bold text-xs">{coords.y}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 font-medium shrink-0">Top (0%)</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={coords.y}
            onChange={(e) => onChange(`${coords.x}% ${e.target.value}%`)}
            className="w-full accent-[#D4A574] cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <span className="text-[11px] text-zinc-400 font-medium shrink-0">Bottom (100%)</span>
        </div>

        {/* Clean, Simple Presets */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mr-1">Presets:</span>
          {[
            { label: 'Top', val: '0%' },
            { label: 'Upper (25%)', val: '25%' },
            { label: 'Center (50%)', val: '50%' },
            { label: 'Lower (75%)', val: '75%' },
            { label: 'Bottom', val: '100%' },
          ].map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(`${coords.x}% ${p.val}`)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                coords.y === parseInt(p.val, 10)
                  ? 'bg-[#A67C52] border-[#D4A574] text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onChange('50% 50%')}
            className="px-2 py-1 rounded-lg text-xs font-medium border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer ml-auto flex items-center gap-1"
            title="Reset to 50% 50% Center"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
