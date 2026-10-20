/**
 * Shrinks a photo in the browser before upload: applies EXIF rotation, caps the
 * long edge at 2560 px and re-encodes as JPEG. Camera files of 8–25 MB become
 * 1–3 MB, which uploads quickly on mobile data and fits the server limits.
 */
const PASS_THROUGH = new Set(['image/jpeg', 'image/webp'])
const SMALL_ENOUGH = 4 * 1024 * 1024

export async function prepareImage(file, { maxEdge = 2560, quality = 0.88 } = {}) {
  if (!file.type.startsWith('image/')) return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file
    throw new Error(`${file.name} can't be opened in this browser. Save it as a JPEG and try again.`)
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && PASS_THROUGH.has(file.type) && file.size <= SMALL_ENOUGH) {
    bitmap.close()
    return file
  }

  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff' // flatten transparency for JPEG
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}
