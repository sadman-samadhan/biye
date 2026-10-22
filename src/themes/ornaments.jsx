/**
 * Ornament sets shared by themes. All geometry is drawn in code (no image
 * files) and coloured with theme tokens, so ornaments follow the palette and
 * stay crisp at any size. Aniconic: no figurative motifs.
 */

// Mughal ogee arch in a 0..1 box (used as a clip-path and as an outline)
export const ARCH_PATH = 'M0,1 V0.38 C0,0.27 0.1,0.2 0.22,0.15 C0.36,0.09 0.45,0.06 0.5,0 C0.55,0.06 0.64,0.09 0.78,0.15 C0.9,0.2 1,0.27 1,0.38 V1 Z'

// Betel (paan) leaf, the heart-shaped leaf of Bengali weddings (Laal Paar)
export const LEAF_PATH = 'M0.5,1 C0.46,0.9 0.04,0.7 0.01,0.42 C-0.01,0.17 0.15,0.03 0.33,0.03 C0.42,0.03 0.48,0.08 0.5,0.14 C0.52,0.08 0.58,0.03 0.67,0.03 C0.85,0.03 1.01,0.17 0.99,0.42 C0.96,0.7 0.54,0.9 0.5,1 Z'
// A hand-cut fabric patch, slightly off-square (Nakshi Kantha)
export const PATCH_PATH = 'M0.015,0.03 L0.975,0 L1,0.965 L0.035,1 Z'
// A plain dome (Noor)
export const DOME_PATH = 'M0,1 V0.42 C0,0.19 0.22,0 0.5,0 C0.78,0 1,0.19 1,0.42 V1 Z'

/** Photo masks themes can use: Photo mask="arch" | "leaf" | "patch" | "dome". */
export const MASKS = { arch: ARCH_PATH, leaf: LEAF_PATH, patch: PATCH_PATH, dome: DOME_PATH }

/** Hidden <clipPath> definitions; reference with style={{ clipPath: 'url(#shb-arch)' }}. */
export function ShapeDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }} focusable="false">
      <defs>
        {Object.entries(MASKS).map(([id, d]) => (
          <clipPath key={id} id={`shb-${id}`} clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        ))}
      </defs>
    </svg>
  )
}

/** Outline of any mask shape, drawn over a masked photo. */
export function MaskOutline({ mask = 'arch', className = '', dashed = false }) {
  const d = MASKS[mask] || ARCH_PATH
  return (
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}>
      <path d={d} transform="translate(0.03 0.03) scale(0.94)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={dashed ? '6 5' : undefined} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// ---- Laal Paar: alpona and kolka ------------------------------------------------------

const petal = (r, length, width) => `M0,${-r} Q${width},${-(r + length / 2)} 0,${-(r + length)} Q${-width},${-(r + length / 2)} 0,${-r} Z`

/**
 * Alpona, the white rice-paste floor art of Bengali weddings, drawn as rings of
 * petals. `draw` traces it in (CSS, no JavaScript), `spin` turns it slowly.
 */
export function Alpona({ className = '', draw = false, spin = false, detail = 3 }) {
  const rings = [
    { n: 8, r: 9, l: 26, w: 9 },
    { n: 16, r: 38, l: 22, w: 6 },
    { n: 24, r: 64, l: 16, w: 4 },
  ].slice(0, detail)
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" className={`${draw ? 'shb-draw' : ''} ${spin ? 'shb-spin' : ''} ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <circle r="5" pathLength="1" />
        {rings.map((ring, i) => (
          <g key={i}>
            {Array.from({ length: ring.n }, (_, k) => (
              <path key={k} d={petal(ring.r, ring.l, ring.w)} transform={`rotate(${(360 / ring.n) * k + (i % 2 ? 180 / ring.n : 0)})`} pathLength="1" />
            ))}
            <circle r={ring.r + ring.l + 3} pathLength="1" strokeWidth="0.6" />
          </g>
        ))}
        {detail >= 3 && <circle r="92" strokeDasharray="1 4" strokeWidth="2" />}
        {detail >= 3 && <circle r="97" pathLength="1" strokeWidth="0.7" />}
      </g>
    </svg>
  )
}

export const KOLKA_PATH = 'M31,5 C37,9 35,18 28,25 C22,31 17,36 11,37 C5,38 2,32 4,26 C7,17 14,11 22,7 C25,5 28,4 31,5 Z M14,31 C10,28 12,22 17,22 C21,22 22,26 19,28'

/** Paisley (kolka) motif. */
export function Kolka({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <path d={KOLKA_PATH} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** A repeating saree border band (paar): coloured band, paisley row, fine gold dots. */
export function PaarBand({ id, vertical = false, className = '' }) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none ${className}`}>
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform={vertical ? 'rotate(90 20 20)' : undefined}>
          <rect width="40" height="40" fill="var(--t-accent)" />
          <path d={KOLKA_PATH} fill="none" stroke="var(--t-bg)" strokeWidth="1.8" />
          <circle cx="36" cy="36" r="1.6" fill="var(--t-accent-warm)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

// ---- Nakshi Kantha: running stitch ----------------------------------------------------

/** A running-stitch line with small cross stitches. */
export function StitchLine({ className = '' }) {
  return (
    <svg viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path d="M0,6 H240" stroke="currentColor" strokeWidth="2" strokeDasharray="9 6" strokeLinecap="round" />
      {[40, 120, 200].map((x) => (
        <path key={x} d={`M${x - 5},1 L${x + 5},11 M${x + 5},1 L${x - 5},11`} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** A stitched flower (the kantha lotus motif). */
export function StitchFlower({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2.4" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, k) => (
          <path key={k} d={petal(4, 13, 5)} transform={`rotate(${45 * k})`} />
        ))}
      </g>
      <circle r="3" fill="currentColor" />
    </svg>
  )
}

// ---- Noor: light ------------------------------------------------------------------------

/** An eight-point star with fine rays. */
export function LightStar({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeLinecap="round">
        {Array.from({ length: 16 }, (_, k) => (
          <line key={k} x1="0" y1={k % 2 ? -9 : -7} x2="0" y2={k % 2 ? -14 : -19} strokeWidth={k % 2 ? 0.6 : 1} transform={`rotate(${22.5 * k})`} />
        ))}
      </g>
      <path d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z" fill="currentColor" />
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
  if (ornament === 'light') {
    return (
      <div aria-hidden="true" className={`flex items-center justify-center gap-5 py-12 text-t-ornament ${className}`}>
        <span className="h-px w-24 bg-gradient-to-r from-transparent to-current sm:w-40" />
        <LightStar size={34} />
        <span className="h-px w-24 bg-gradient-to-l from-transparent to-current sm:w-40" />
      </div>
    )
  }
  if (ornament === 'paar') {
    return (
      <div aria-hidden="true" className={`flex items-center justify-center gap-2 py-10 text-t-accent ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Kolka key={i} size={i === 2 ? 30 : 20} className={i % 2 ? '-scale-x-100 opacity-70' : ''} />
        ))}
      </div>
    )
  }
  if (ornament === 'stitch') {
    return (
      <div aria-hidden="true" className={`flex items-center justify-center gap-3 py-10 text-t-accent ${className}`}>
        <StitchLine className="h-3 w-24 sm:w-40" />
        <StitchFlower size={34} className="text-t-accent-warm" />
        <StitchLine className="h-3 w-24 sm:w-40" />
      </div>
    )
  }
  if (ornament === 'rule') {
    return (
      <div aria-hidden="true" className={`mx-auto max-w-6xl px-6 py-8 ${className}`}>
        <div className="h-1 bg-t-ink" />
        <div className="mt-1 h-px bg-t-ink" />
      </div>
    )
  }
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
  if (kind === 'alpona') return <Alpona className={`absolute inset-0 h-full w-full ${className}`} />
  if (kind === 'stitch') {
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true" className={`absolute inset-0 h-full w-full ${className}`}>
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx="100" cy="100" r="94" strokeWidth="2" strokeDasharray="8 6" />
          <circle cx="100" cy="100" r="82" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.7" />
        </g>
        {[0, 90, 180, 270].map((a) => (
          <circle key={a} cx="100" cy="6" r="5" fill="currentColor" transform={`rotate(${a} 100 100)`} />
        ))}
      </svg>
    )
  }
  if (kind === 'seal') {
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true" className={`absolute inset-0 h-full w-full ${className}`}>
        <g fill="none" stroke="currentColor">
          <rect x="4" y="4" width="192" height="192" strokeWidth="3" />
          <rect x="14" y="14" width="172" height="172" strokeWidth="1" />
        </g>
      </svg>
    )
  }
  if (kind === 'light') {
    return (
      <svg viewBox="0 0 200 240" aria-hidden="true" className={`absolute inset-0 h-full w-full ${className}`}>
        <defs>
          <radialGradient id="noor-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M10,235 V100 C10,45 50,8 100,8 C150,8 190,45 190,100 V235" fill="url(#noor-glow)" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    )
  }
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
