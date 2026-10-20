/**
 * A wedding photo. Photos arrive pre-resized (thumb/web variants) as short-lived
 * signed URLs, so this is a plain <img> rather than next/image. Dragging and the
 * "save image" target are disabled together with MediaGuard; `mask="arch"`
 * clips it to the theme's arch shape.
 */
export default function Photo({ src, thumb, alt = '', position = '50% 50%', mask, className = '', sizes, eager = false, width, height, lqip }) {
  if (!src) return null
  const srcSet = thumb && thumb !== src ? `${thumb} 480w, ${src} 1600w` : undefined
  return (
    // eslint-disable-next-line @next/next/no-img-element -- variants are pre-built and URLs are private
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes || '100vw' : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      draggable={false}
      data-media
      className={className}
      style={{
        objectPosition: position || '50% 50%',
        ...(mask === 'arch' ? { clipPath: 'url(#shb-arch)' } : {}),
        ...(lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: 'cover' } : {}),
      }}
    />
  )
}
