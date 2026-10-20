import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server/admin-session'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { DEMO_SITE, DEMO_CONTENT } from '@/lib/getData'
import { deleteSiteStorage } from '@/lib/storage'

export async function GET(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied

  const resolvedParams = await params
  const id = resolvedParams?.id

  if (!isSupabaseConfigured || id === 'demo-rafa-shawon') {
    return NextResponse.json({
      site: DEMO_SITE,
      ...DEMO_CONTENT,
      messages: []
    })
  }

  try {
    const supabase = getSupabaseAdmin()

    // 1. Fetch site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()

    if (siteError) throw siteError

    // 2. Fetch site content
    const { data: contentData } = await supabase
      .from('site_content')
      .select('*')
      .eq('site_id', id)
      .maybeSingle()

    // 3. Fetch messages for moderation
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('site_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      site,
      content: contentData?.content || {},
      ceremonies: contentData?.ceremonies || [],
      duas: contentData?.duas || { duas: [], parentBlessings: {} },
      gallery: contentData?.gallery || [],
      messages: messages || []
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied

  const resolvedParams = await params
  const id = resolvedParams?.id

  try {
    const body = await req.json()
    const {
      status,
      palette,
      palette_options,
      selected_palette_index,
      owner_name,
      owner_email,
      owner_phone,
      content,
      ceremonies,
      duas,
      gallery
    } = body

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, message: 'Mock updated' })
    }

    const supabase = getSupabaseAdmin()

    // Update site table
    const siteUpdates = { updated_at: new Date().toISOString() }
    if (status !== undefined) siteUpdates.status = status
    if (body.wedding_type !== undefined) siteUpdates.wedding_type = body.wedding_type
    if (palette !== undefined) siteUpdates.palette = palette
    if (palette_options !== undefined) siteUpdates.palette_options = palette_options
    if (selected_palette_index !== undefined) siteUpdates.selected_palette_index = selected_palette_index
    if (owner_name !== undefined) siteUpdates.owner_name = owner_name
    if (owner_email !== undefined) siteUpdates.owner_email = owner_email
    if (owner_phone !== undefined) siteUpdates.owner_phone = owner_phone

    const { error: siteError } = await supabase
      .from('sites')
      .update(siteUpdates)
      .eq('id', id)

    if (siteError) throw siteError

    // Update site_content table
    if (content !== undefined || ceremonies !== undefined || duas !== undefined || gallery !== undefined) {
      const contentUpdates = { updated_at: new Date().toISOString() }
      if (content !== undefined) contentUpdates.content = content
      if (ceremonies !== undefined) contentUpdates.ceremonies = ceremonies
      if (duas !== undefined) contentUpdates.duas = duas
      if (gallery !== undefined) contentUpdates.gallery = gallery

      const { error: contentError } = await supabase
        .from('site_content')
        .upsert({ site_id: id, ...contentUpdates }, { onConflict: 'site_id' })

      if (contentError) throw contentError
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied

  const resolvedParams = await params
  const id = resolvedParams?.id
  const isPermanentParam = req.nextUrl?.searchParams?.get('permanent') === 'true'

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      success: true,
      message: isPermanentParam ? 'Mock permanently deleted with media purged' : 'Mock archived to trash'
    })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Fetch site status & slug first
    const { data: site, error: fetchErr } = await supabase
      .from('sites')
      .select('id, slug, status')
      .eq('id', id)
      .single()

    if (fetchErr) throw fetchErr

    const isAlreadyArchived = site?.status === 'archived'

    if (isPermanentParam || isAlreadyArchived) {
      // Stage 2: Permanent deletion - Purge Supabase storage strictly for this site and remove DB records
      console.log(`[DELETE /api/admin/sites/${id}] Permanent purge requested. Purging storage for site ${site.id} (${site.slug})...`)
      try {
        await deleteSiteStorage(site.id, site.slug)
      } catch (storageErr) {
        console.error('[DELETE /api/admin/sites] Storage deletion warning:', storageErr)
      }

      // Delete child records first
      await supabase.from('messages').delete().eq('site_id', id)
      await supabase.from('site_content').delete().eq('site_id', id)

      // Delete main site record
      const { error: deleteError } = await supabase.from('sites').delete().eq('id', id)
      if (deleteError) throw deleteError

      return NextResponse.json({
        success: true,
        permanent: true,
        message: 'Site and all associated media permanently deleted.'
      })
    } else {
      // Stage 1: Soft delete - Move site to 'archived' / trash preview state
      console.log(`[DELETE /api/admin/sites/${id}] Moving site to trash / archived state...`)
      const { error: archiveError } = await supabase
        .from('sites')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (archiveError) throw archiveError

      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Site moved to Trash / Preview state.'
      })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
