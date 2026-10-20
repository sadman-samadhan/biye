import sharp from 'sharp'
import { createHash } from 'node:crypto'

/**
 * Variant ladder (long edge, px). Guests get thumb + web; master is for the
 * couple's downloads and for rebuilding web (e.g. toggling the watermark).
 * Originals from cameras are never stored.
 */
export const IMAGE_VARIANTS = {
  thumb: { size: 480, format: 'webp', quality: 72 },
  web: { size: 1600, format: 'webp', quality: 80 },
  master: { size: 2048, format: 'jpeg', quality: 86 },
}

const MIME = { webp: 'image/webp', jpeg: 'image/jpeg' }
const EXT = { webp: 'webp', jpeg: 'jpg' }

export const variantMime = (format) => MIME[format]
export const variantExt = (format) => EXT[format]

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])
}

function watermarkSvg(width, height, text) {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.028))
  const pad = Math.round(fontSize * 1.2)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <style>text{font-family:'DejaVu Sans','Segoe UI',Arial,sans-serif;font-size:${fontSize}px;font-weight:600;letter-spacing:.04em}</style>
      <text x="${width - pad}" y="${height - pad}" text-anchor="end" fill="#000" fill-opacity=".35" transform="translate(1,1)">${escapeXml(text)}</text>
      <text x="${width - pad}" y="${height - pad}" text-anchor="end" fill="#fff" fill-opacity=".72">${escapeXml(text)}</text>
    </svg>`
  )
}

async function renderVariant(input, { size, format, quality }, watermarkText) {
  let pipeline = sharp(input, { limitInputPixels: 60_000_000, failOn: 'error' })
    .rotate()
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })

  if (watermarkText) {
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    pipeline = sharp(data).composite([{ input: watermarkSvg(info.width, info.height, watermarkText), top: 0, left: 0 }])
  }

  pipeline = format === 'jpeg' ? pipeline.jpeg({ quality, mozjpeg: true }) : pipeline.webp({ quality, effort: 5, smartSubsample: true })
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
  return { buffer: data, w: info.width, h: info.height, bytes: data.length, ext: EXT[format], format }
}

/**
 * Turns an uploaded image into thumb/web/master variants plus a tiny blurred
 * placeholder. EXIF orientation is applied and all metadata (incl. GPS) dropped.
 */
export async function processImage(buffer, { watermarkText } = {}) {
  const meta = await sharp(buffer, { limitInputPixels: 60_000_000 }).metadata()
  if (!['jpeg', 'png', 'webp', 'heif', 'avif', 'gif'].includes(meta.format)) {
    throw new Error('Unsupported image format')
  }

  const [thumb, web, master] = await Promise.all([
    renderVariant(buffer, IMAGE_VARIANTS.thumb),
    renderVariant(buffer, IMAGE_VARIANTS.web, watermarkText),
    renderVariant(buffer, IMAGE_VARIANTS.master),
  ])
  const lqipBuffer = await sharp(buffer).rotate().resize(24, 24, { fit: 'inside' }).webp({ quality: 35 }).toBuffer()

  return {
    variants: { thumb, web, master },
    width: master.w,
    height: master.h,
    lqip: `data:image/webp;base64,${lqipBuffer.toString('base64')}`,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  }
}

/** Rebuilds only the web variant from the stored master (watermark on/off). */
export async function rebuildWebVariant(masterBuffer, { watermarkText } = {}) {
  return renderVariant(masterBuffer, IMAGE_VARIANTS.web, watermarkText)
}
