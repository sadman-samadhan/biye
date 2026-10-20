import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { writeAudit } from '@/lib/server/site-data'
import { slugProblem } from '@/lib/slugs'
import { validateSettings } from '@/lib/content/schema'

/**
 * Update site-level settings. Couples may change look & feel fields; operators
 * may also change slug, status, plan, products, expiry and owner details.
 */
export async function PATCH(req, { params }) {
  const { siteId } = await params
  const { denied, user, isAdmin } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const result = validateSettings(body, { isAdmin })
  if (!result.ok) return NextResponse.json({ error: 'Invalid settings', issues: result.issues }, { status: 400 })
  if (!Object.keys(result.data).length) return NextResponse.json({ success: true })

  if (result.data.slug !== undefined) {
    const problem = slugProblem(result.data.slug)
    if (problem) return NextResponse.json({ error: problem }, { status: 400 })
  }

  const { data, error } = await serviceClient()
    .from('sites')
    .update({ ...result.data, updated_at: new Date().toISOString() })
    .eq('id', siteId)
    .select('id')
  if (error) {
    const duplicate = error.code === '23505'
    return NextResponse.json({ error: duplicate ? 'That address is already taken' : error.message }, { status: duplicate ? 409 : 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await writeAudit({
    actorKind: isAdmin ? 'admin' : 'member',
    actorId: user.id,
    siteId,
    action: 'settings.update',
    meta: { keys: Object.keys(result.data) },
  })
  return NextResponse.json({ success: true })
}
