import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { writeAudit } from '@/lib/server/site-data'
import { CONTENT_SECTIONS, COLUMN_SECTIONS, validateSection } from '@/lib/content/schema'

/**
 * Save one section of a site's content.
 * Body: { section, data, expectedVersion? }
 * Uses compare-and-swap on site_content.version: a stale editor gets 409 instead
 * of silently overwriting someone else's changes.
 */
export async function PATCH(req, { params }) {
  const { siteId } = await params
  const { denied, user, isAdmin } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const body = await req.json().catch(() => null)
  const section = body?.section
  if (!section || (!CONTENT_SECTIONS.has(section) && !COLUMN_SECTIONS.has(section))) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 400 })
  }

  const result = validateSection(section, body.data)
  if (!result.ok) return NextResponse.json({ error: `Invalid ${section}`, issues: result.issues }, { status: 400 })

  const supabase = serviceClient()
  const { data: row } = await supabase
    .from('site_content')
    .select('content, version')
    .eq('site_id', siteId)
    .maybeSingle()

  const currentVersion = row?.version ?? 0
  if (Number.isInteger(body.expectedVersion) && body.expectedVersion !== currentVersion) {
    return NextResponse.json(
      { error: 'This site was changed somewhere else. Reload to see the latest version.', version: currentVersion },
      { status: 409 }
    )
  }

  const update = CONTENT_SECTIONS.has(section)
    ? { content: { ...(row?.content || {}), [section]: result.data } }
    : { [section]: result.data }
  const nextVersion = currentVersion + 1

  let error
  if (row) {
    const res = await supabase
      .from('site_content')
      .update({ ...update, version: nextVersion, updated_at: new Date().toISOString() })
      .eq('site_id', siteId)
      .eq('version', currentVersion)
      .select('version')
    error = res.error
    if (!error && !res.data?.length) {
      return NextResponse.json({ error: 'This site was changed somewhere else. Reload to see the latest version.' }, { status: 409 })
    }
  } else {
    ;({ error } = await supabase.from('site_content').insert({ site_id: siteId, ...update, version: nextVersion }))
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actorKind: isAdmin ? 'admin' : 'member',
    actorId: user.id,
    siteId,
    action: 'content.update',
    meta: { section, version: nextVersion },
  })
  return NextResponse.json({ success: true, version: nextVersion, data: result.data })
}
