import { NextResponse } from 'next/server'
import { assertSameOrigin, getCurrentUser, requireAdmin } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { writeAudit } from '@/lib/server/site-data'
import { slugify, slugProblem } from '@/lib/slugs'
import { validateSection, validateSettings, CONTENT_SECTIONS } from '@/lib/content/schema'
import { normalizePalette } from '@/lib/palettes'
import { encryptPasscode, newPasscode } from '@/lib/server/guest-access'

const notConfigured = () => NextResponse.json({ error: 'Database is not configured' }, { status: 503 })

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  if (!isSupabaseConfigured()) return notConfigured()

  const { data, error } = await serviceClient()
    .from('sites')
    .select('id, slug, status, wedding_type, template_id, palette, owner_name, owner_email, owner_phone, plan, products, plan_expiry_date, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sites: data || [] })
}

export async function POST(req) {
  const denied = (await requireAdmin()) || (await assertSameOrigin())
  if (denied) return denied
  if (!isSupabaseConfigured()) return notConfigured()

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const slug = slugify(body.slug)
  const problem = slugProblem(slug)
  if (problem) return NextResponse.json({ error: problem }, { status: 400 })

  const settings = validateSettings(
    {
      ...(body.palette ? { palette: body.palette } : {}),
      ...(body.palette_options ? { palette_options: body.palette_options } : {}),
      ...(body.selected_palette_index !== undefined ? { selected_palette_index: body.selected_palette_index } : {}),
      wedding_type: body.wedding_type || 'muslim',
      ...(body.template_id ? { template_id: body.template_id } : {}),
      status: body.status || 'draft',
      ...(body.plan ? { plan: body.plan } : {}),
      ...(body.products ? { products: body.products } : {}),
      owner_name: body.owner_name || null,
      owner_email: body.owner_email || '',
      owner_phone: body.owner_phone || null,
    },
    { isAdmin: true }
  )
  if (!settings.ok) return NextResponse.json({ error: 'Invalid site settings', issues: settings.issues }, { status: 400 })

  // Content arrives as one blob from the intake form; validate each known section.
  const content = {}
  for (const [key, value] of Object.entries(body.content || {})) {
    if (value === undefined || value === null) continue
    if (!CONTENT_SECTIONS.has(key)) continue
    const result = validateSection(key, value)
    if (!result.ok) return NextResponse.json({ error: `Invalid ${key}`, issues: result.issues }, { status: 400 })
    content[key] = result.data
  }
  const columns = {}
  for (const key of ['ceremonies', 'duas', 'gallery']) {
    if (body[key] === undefined) continue
    const result = validateSection(key, body[key])
    if (!result.ok) return NextResponse.json({ error: `Invalid ${key}`, issues: result.issues }, { status: 400 })
    columns[key] = result.data
  }

  const supabase = serviceClient()
  const { data: site, error } = await supabase
    .from('sites')
    .insert({ slug, ...settings.data, palette: settings.data.palette || normalizePalette(null) })
    .select()
    .single()

  if (error) {
    const duplicate = error.code === '23505'
    return NextResponse.json({ error: duplicate ? `The address "${slug}" is already taken` : error.message }, { status: duplicate ? 409 : 500 })
  }

  const { error: contentError } = await supabase.from('site_content').insert({
    site_id: site.id,
    content: { ...content, wedding_type: settings.data.wedding_type },
    ceremonies: columns.ceremonies || [],
    duas: columns.duas || { duas: [], parentBlessings: {} },
    gallery: columns.gallery || [],
  })
  // Every new site starts with a passcode so the memories stay private by default
  const { error: accessError } = await supabase.from('site_access').insert({ site_id: site.id, passcode_enc: encryptPasscode(newPasscode()) })

  if (contentError || accessError) {
    await supabase.from('sites').delete().eq('id', site.id)
    return NextResponse.json({ error: (contentError || accessError).message }, { status: 500 })
  }

  const user = await getCurrentUser()
  await writeAudit({ actorKind: 'admin', actorId: user?.id, siteId: site.id, action: 'site.create', meta: { slug } })
  return NextResponse.json({ success: true, site })
}
