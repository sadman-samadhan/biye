import { NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DEMO_SITE } from '@/lib/getData'
import { generateMonogram } from '@/lib/monogramGenerator'
import { uploadSiteImage } from '@/lib/storage'

export async function GET() {
  if (!isSupabaseConfigured) {
    // Return demo site in offline / mock mode
    return NextResponse.json({
      sites: [DEMO_SITE]
    })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ sites: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      slug,
      status = 'draft',
      wedding_type = 'muslim',
      template_id = 'classic',
      palette,
      palette_options = [],
      selected_palette_index = 0,
      owner_name,
      owner_email,
      owner_phone,
      content = {},
      ceremonies = [],
      duas = { duas: [], parentBlessings: {} },
      gallery = []
    } = body

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Clean slug
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-')

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        message: 'Mock creation (Supabase not configured in .env.local)',
        site: { id: 'mock-' + Date.now(), slug: cleanSlug, owner_name, status, wedding_type }
      })
    }

    const supabase = getSupabaseAdmin()

    // 1. Insert into sites table (try with wedding_type, fallback without if column absent)
    let site = null
    const siteDataWithTradition = {
      slug: cleanSlug,
      status,
      wedding_type,
      template_id,
      palette: palette || {},
      palette_options,
      selected_palette_index,
      owner_name,
      owner_email,
      owner_phone
    }

    let insertRes = await supabase
      .from('sites')
      .insert(siteDataWithTradition)
      .select()
      .single()

    if (insertRes.error && insertRes.error.message?.includes('wedding_type')) {
      // Column might not exist in current migration yet; retry without it
      const { wedding_type: _, ...siteDataWithout } = siteDataWithTradition
      insertRes = await supabase
        .from('sites')
        .insert(siteDataWithout)
        .select()
        .single()
    }

    if (insertRes.error) {
      throw insertRes.error
    }
    site = insertRes.data

    // 2. Dynamic Monogram Generation (if not already set)
    let finalContent = { ...content, wedding_type }
    if (!finalContent.logoUrl && finalContent.sectionToggles?.monogram !== false) {
      try {
        const rawNames = finalContent?.hero?.coupleNames?.en || owner_name || 'Bride & Groom'
        const names = rawNames.includes('&') ? rawNames.split('&').map(s => s.trim()) : [rawNames, '']
        const monogramBuf = await generateMonogram({
          name1: names[0] || 'Bride',
          name2: names[1] || 'Groom',
          blessingText: finalContent?.blessing?.en || finalContent?.hero?.blessing?.en,
          verseSnippet: finalContent?.blessing?.reference || finalContent?.hero?.blessing?.reference,
          venue: ceremonies[0]?.venue?.en || '',
          weddingType: wedding_type
        })

        const uploadRes = await uploadSiteImage(monogramBuf, {
          siteId: site.id,
          category: 'monogram',
          filename: 'wedding_monogram.png'
        })
        if (uploadRes?.publicUrl) {
          finalContent.logoUrl = uploadRes.publicUrl
        } else {
          finalContent.logoUrl = `data:image/png;base64,${monogramBuf.toString('base64')}`
        }
      } catch (monoErr) {
        console.warn('Auto monogram generation skipped:', monoErr.message)
      }
    }

    // 3. Insert into site_content table
    const { error: contentError } = await supabase
      .from('site_content')
      .insert({
        site_id: site.id,
        content: finalContent,
        ceremonies,
        duas,
        gallery
      })

    if (contentError) throw contentError

    return NextResponse.json({ success: true, site })
  } catch (err) {
    console.error('Error creating site:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
