import { NextResponse } from 'next/server'
import { assertSameOrigin, getCurrentUser, requireAdmin } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { writeAudit } from '@/lib/server/site-data'
import { validateSection, validateSettings, CONTENT_SECTIONS } from '@/lib/content/schema'
import { deleteSiteStorage } from '@/lib/storage'

const notConfigured = () => NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
const SETTINGS_KEYS = [
  'status', 'wedding_type', 'palette', 'palette_options', 'selected_palette_index', 'owner_name', 'owner_email',
  'owner_phone', 'template_id', 'plan', 'products', 'plan_expiry_date', 'phase_override', 'public_contact',
  'theme_settings', 'tradition_variant', 'default_locale', 'memories_published', 'storage_quota_bytes',
]

export async function GET(req, { params }) {
  const denied = await requireAdmin()
  if (denied) return denied
  if (!isSupabaseConfigured()) return notConfigured()
  const { id } = await params

  const supabase = serviceClient()
  const { data: site, error } = await supabase.from('sites').select('*').eq('id', id).maybeSingle()
  if (error || !site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: contentData }, { data: messages }] = await Promise.all([
    supabase.from('site_content').select('*').eq('site_id', id).maybeSingle(),
    supabase.from('messages').select('*').eq('site_id', id).order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    site,
    content: contentData?.content || {},
    ceremonies: contentData?.ceremonies || [],
    duas: contentData?.duas || { duas: [], parentBlessings: {} },
    gallery: contentData?.gallery || [],
    invitation: contentData?.invitation || {},
    version: contentData?.version || 1,
    messages: messages || [],
  })
}

/**
 * Full save used by the current operator editor. Every section is validated;
 * the per-section PATCH API (/api/sites/[siteId]/content) replaces this later.
 */
export async function PUT(req, { params }) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return notConfigured()
  const { id } = await params

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const settingsInput = Object.fromEntries(SETTINGS_KEYS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]))
  const settings = validateSettings(settingsInput, { isAdmin: true })
  if (!settings.ok) return NextResponse.json({ error: 'Invalid site settings', issues: settings.issues }, { status: 400 })

  const supabase = serviceClient()
  const { data: existing } = await supabase.from('sites').select('id').eq('id', id).maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error: siteError } = await supabase
    .from('sites')
    .update({ ...settings.data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (siteError) return NextResponse.json({ error: siteError.message }, { status: 500 })

  const contentUpdates = {}
  if (body.content !== undefined) {
    const content = {}
    for (const [key, value] of Object.entries(body.content || {})) {
      if (value === undefined || value === null) continue
      if (!CONTENT_SECTIONS.has(key)) continue
      const result = validateSection(key, value)
      if (!result.ok) return NextResponse.json({ error: `Invalid ${key}`, issues: result.issues }, { status: 400 })
      content[key] = result.data
    }
    if (settings.data.wedding_type) content.wedding_type = settings.data.wedding_type
    contentUpdates.content = content
  }
  for (const key of ['ceremonies', 'duas', 'gallery', 'invitation']) {
    if (body[key] === undefined) continue
    const result = validateSection(key, body[key])
    if (!result.ok) return NextResponse.json({ error: `Invalid ${key}`, issues: result.issues }, { status: 400 })
    contentUpdates[key] = result.data
  }

  if (Object.keys(contentUpdates).length) {
    const { data: current } = await supabase.from('site_content').select('version').eq('site_id', id).maybeSingle()
    const { error: contentError } = await supabase
      .from('site_content')
      .upsert(
        { site_id: id, ...contentUpdates, version: (current?.version || 0) + 1, updated_at: new Date().toISOString() },
        { onConflict: 'site_id' }
      )
    if (contentError) return NextResponse.json({ error: contentError.message }, { status: 500 })
  }

  const user = await getCurrentUser()
  await writeAudit({ actorKind: 'admin', actorId: user?.id, siteId: id, action: 'site.update', meta: { keys: Object.keys(settings.data) } })
  return NextResponse.json({ success: true })
}

/**
 * Stage 1: move to trash (status 'archived'). Stage 2 (only for archived sites,
 * with ?permanent=true): purge storage and rows.
 */
export async function DELETE(req, { params }) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return notConfigured()
  const { id } = await params
  const permanent = req.nextUrl.searchParams.get('permanent') === 'true'

  const supabase = serviceClient()
  const { data: site, error } = await supabase.from('sites').select('id, slug, status').eq('id', id).maybeSingle()
  if (error || !site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const user = await getCurrentUser()

  if (!permanent) {
    const { error: archiveError } = await supabase
      .from('sites')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (archiveError) return NextResponse.json({ error: archiveError.message }, { status: 500 })
    await writeAudit({ actorKind: 'admin', actorId: user?.id, siteId: id, action: 'site.archive' })
    return NextResponse.json({ success: true, archived: true, message: 'Site moved to Trash.' })
  }

  if (site.status !== 'archived') {
    return NextResponse.json({ error: 'Move the site to Trash before deleting it permanently.' }, { status: 409 })
  }

  try {
    await deleteSiteStorage(site.id, site.slug)
  } catch (storageErr) {
    console.error('[DELETE site] storage purge failed:', storageErr)
    return NextResponse.json({ error: 'Could not purge stored media; nothing was deleted.' }, { status: 500 })
  }

  const { error: deleteError } = await supabase.from('sites').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  await writeAudit({ actorKind: 'admin', actorId: user?.id, siteId: null, action: 'site.purge', meta: { id, slug: site.slug } })
  return NextResponse.json({ success: true, permanent: true, message: 'Site and all its media were permanently deleted.' })
}
