import { NextResponse } from 'next/server'
import { uploadSiteImage, uploadSiteVideo } from '@/lib/storage'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const siteId = formData.get('siteId') || 'general'
    const category = formData.get('category') || 'gallery'

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const isVideo = file.type?.startsWith('video/') || category === 'video' || /\.(mp4|webm)$/i.test(file.name)

    let result
    if (isVideo) {
      result = await uploadSiteVideo(buffer, {
        siteId,
        filename: file.name,
        contentType: file.type || 'video/mp4'
      })
    } else {
      // All images strictly pass through sharp optimization pipeline
      result = await uploadSiteImage(buffer, {
        siteId,
        category,
        filename: file.name
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('API Upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
