import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { uploadSiteImage, uploadSiteVideo } from '@/lib/storage'

const MAX_IMAGE_BYTES = 25 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const VIDEO_TYPES = { 'video/mp4': 'mp4', 'video/webm': 'webm' }
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9_-]{0,62}$/i

export async function POST(req) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const siteId = String(formData.get('siteId') || 'general')
    const category = String(formData.get('category') || 'gallery')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!SAFE_SEGMENT.test(siteId) || !SAFE_SEGMENT.test(category)) {
      return NextResponse.json({ error: 'Invalid upload target' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (VIDEO_TYPES[file.type]) {
      const result = await uploadSiteVideo(buffer, {
        siteId,
        filename: `${file.name.replace(/\.[^/.]+$/, '')}.${VIDEO_TYPES[file.type]}`,
        contentType: file.type,
      })
      return NextResponse.json(result)
    }

    if (!IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP images or MP4/WebM videos are allowed' }, { status: 415 })
    }
    if (buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image exceeds 25 MB' }, { status: 413 })
    }

    // All images strictly pass through sharp optimization pipeline
    const result = await uploadSiteImage(buffer, { siteId, category, filename: file.name })
    return NextResponse.json(result)
  } catch (err) {
    console.error('API Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
