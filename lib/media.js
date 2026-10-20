/**
 * Pure media path helpers, safe to import from client components.
 */

// Handles absolute URLs (storage), and paths relative to /public/images
export function getImagePath(filename) {
  if (!filename) return ''

  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:')) {
    return filename
  }

  const clean = filename.startsWith('/') ? filename.slice(1) : filename
  if (clean.startsWith('images/') || clean.startsWith('demo/') || clean.startsWith('monogram-frames/')) {
    return `/${clean}`
  }
  return `/images/${clean}`
}

export function getVideoPath(filename) {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  return `/videos/${filename.startsWith('/') ? filename.slice(1) : filename}`
}

export function getAudioPath(filename) {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  return `/audio/${filename.startsWith('/') ? filename.slice(1) : filename}`
}
