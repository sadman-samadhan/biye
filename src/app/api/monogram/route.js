import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/auth'
import { generateMonogram } from '@/lib/monogramGenerator'
import { uploadSiteImage } from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/server/supabase'

export async function POST(req) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await req.json()
    const clip = (value, max) => (typeof value === 'string' ? value.slice(0, max) : undefined)
    const name1 = clip(body.name1, 40) || 'Bride'
    const name2 = clip(body.name2, 40) || 'Groom'
    const blessingText = clip(body.blessingText, 160)
    const verseSnippet = clip(body.verseSnippet, 80)
    const venue = clip(body.venue, 80)
    const weddingType = body.weddingType === 'hindu' ? 'hindu' : 'muslim'
    const siteId = typeof body.siteId === 'string' && /^[a-z0-9][a-z0-9_-]{0,62}$/i.test(body.siteId) ? body.siteId : null

    // Generate PNG buffer via node canvas
    const buffer = await generateMonogram({
      name1,
      name2,
      blessingText,
      verseSnippet,
      venue,
      weddingType
    })

    const base64Data = buffer.toString('base64')
    const dataUri = `data:image/png;base64,${base64Data}`

    let uploadedUrl = null

    // If siteId provided and Supabase is configured, upload to storage
    if (siteId && isSupabaseConfigured()) {
      try {
        const uploadRes = await uploadSiteImage(buffer, {
          siteId,
          category: 'monogram',
          filename: 'wedding_monogram.png'
        })
        if (uploadRes?.publicUrl) {
          uploadedUrl = uploadRes.publicUrl
        }
      } catch (uploadErr) {
        console.warn('Could not upload monogram to storage, returning dataUri:', uploadErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl || dataUri,
      dataUri
    })
  } catch (err) {
    console.error('Monogram generation error:', err)
    return NextResponse.json({ error: 'Monogram generation failed' }, { status: 500 })
  }
}
