/**
 * Ornament sets shared by themes. All geometry is drawn in code (no image
 * files) and coloured with theme tokens, so ornaments follow the palette and
 * stay crisp at any size. Aniconic: no figurative motifs.
 */

// Mughal ogee arch in a 0..1 box (used as a clip-path and as an outline)
export const ARCH_PATH = 'M0,1 V0.38 C0,0.27 0.1,0.2 0.22,0.15 C0.36,0.09 0.45,0.06 0.5,0 C0.55,0.06 0.64,0.09 0.78,0.15 C0.9,0.2 1,0.27 1,0.38 V1 Z'

/** Hidden <clipPath> definitions; reference with style={{ clipPath: 'url(#shb-arch)' }}. */
export function ShapeDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }} focusable="false">
      <defs>
        <clipPath id="shb-arch" clipPathUnits="objectBoundingBox">
          <path d={ARCH_PATH} />
        </clipPath>
      </defs>
    </svg>
  )
}

/** Arch outline drawn over a masked photo (inset frame). */
export function ArchOutline({ className = '', inset = 0.03 }) {
  const k = 1 - inset * 2
  return (
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}>
      <path d={ARCH_PATH} transform={`translate(${inset} ${inset}) scale(${k})`} fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <path d={ARCH_PATH} fill="none" stroke="currentColor" strokeWidth="0.75" vectorEffect="non-scaling-stroke" opacity="0.5" />
    </svg>
  )
}

/** Eight-pointed star (khatam) used as a medallion. */
export function KhatamStar({ size = 28, className = '', filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <g fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
        <rect x="9" y="9" width="22" height="22" />
        <rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)" />
      </g>
      <circle cx="20" cy="20" r="3.2" fill="currentColor" />
    </svg>
  )
}

/** Repeating girih lattice as a background layer. */
export function GirihPattern({ id = 'girih', className = '', opacity = 0.08 }) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }}>
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="17" y="17" width="22" height="22" />
            <rect x="17" y="17" width="22" height="22" transform="rotate(45 28 28)" />
            <path d="M28 0 V12.4 M28 43.6 V56 M0 28 H12.4 M43.6 28 H56" />
            <path d="M0 0 L12 12 M56 0 L44 12 M0 56 L12 44 M56 56 L44 44" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Section dividers per ornament set. */
export function Divider({ ornament = 'line', className = '' }) {
  if (ornament === 'girih') {
    return (
      <div aria-hidden="true" className={`flex items-center justify-center gap-4 py-10 text-t-ornament ${className}`}>
        <span className="h-px w-20 bg-current opacity-50 sm:w-32" />
        <KhatamStar size={26} />
        <span className="h-px w-20 bg-current opacity-50 sm:w-32" />
      </div>
    )
  }
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 py-10 text-t-ornament ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-current opacity-60 sm:w-28" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current opacity-80" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-current opacity-60 sm:w-28" />
    </div>
  )
}

/** Monogram frames. Content (initials) is rendered by the caller inside. */
export function MonogramFrame({ kind = 'ring', className = '' }) {
  if (kind === 'arch') {
    return (
      <svg viewBox="0 0 200 240" aria-hidden="true" className={`absolute inset-0 h-full w-full ${className}`}>
        <g fill="none" stroke="currentColor">
          <path d="M10,235 V96 C10,70 34,52 58,42 C86,30 98,22 100,6 C102,22 114,30 142,42 C166,52 190,70 190,96 V235 Z" strokeWidth="1.6" />
          <path d="M22,228 V100 C22,78 42,63 63,54 C87,44 97,37 100,24 C103,37 113,44 137,54 C158,63 178,78 178,100 V228 Z" strokeWidth="0.8" opacity="0.6" />
        </g>
        <g transform="translate(88 0)" className="text-t-ornament">
          <rect x="6" y="-2" width="12" height="12" transform="rotate(45 12 4)" fill="currentColor" />
        </g>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={`absolute inset-0 h-full w-full ${className}`}>
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="96" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="86" strokeWidth="0.7" opacity="0.6" />
        <circle cx="100" cy="100" r="91" strokeWidth="0.6" strokeDasharray="1 5" opacity="0.8" />
      </g>
    </svg>
  )
}
