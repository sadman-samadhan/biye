import { NextResponse } from 'next/server'
import { generateMonogram } from '@/lib/monogramGenerator'
import { uploadSiteImage } from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      name1 = 'Bride',
      name2 = 'Groom',
      blessingText,
      verseSnippet,
      venue,
      weddingType = 'muslim',
      siteId
    } = body

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
    if (siteId && isSupabaseConfigured) {
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
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
