import Image from 'next/image'

// Lockup aspect ratio from public/brand/shubhobiye/logo.svg (viewBox 0 0 482 100)
const LOCKUP_RATIO = 482 / 100

/**
 * ShubhoBiye logo. `variant="lockup"` shows the marigold with the bilingual
 * wordmark; `variant="mark"` shows the marigold alone. `tone="dark"` is for dark
 * backgrounds (light wordmark).
 */
export default function BrandLogo({ variant = 'lockup', tone = 'light', height = 40, className = '', priority = false }) {
  if (variant === 'mark') {
    return (
      <Image
        src="/brand/shubhobiye/mark.svg"
        alt="ShubhoBiye"
        width={height}
        height={height}
        className={className}
        priority={priority}
        unoptimized
      />
    )
  }
  return (
    <Image
      src={tone === 'dark' ? '/brand/shubhobiye/logo-dark.svg' : '/brand/shubhobiye/logo.svg'}
      alt="ShubhoBiye — শুভ বিয়ে"
      width={Math.round(height * LOCKUP_RATIO)}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  )
}
