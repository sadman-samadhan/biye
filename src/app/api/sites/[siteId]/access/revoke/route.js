import { NextResponse } from 'next/server'
import { assertSameOrigin, authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteById, writeAudit } from '@/lib/server/site-data'
import { describeAccess, ensureSiteAccess, siteOrigin } from '@/lib/server/site-access'

/** Signs every guest out (same passcode, new version). Old unlock links stop working. */
export async function POST(req, { params }) {
  const { siteId } = await params
  const { denied, user, isAdmin } = await authorizeSite(siteId)
  if (denied) return denied
  const crossOrigin = await assertSameOrigin()
  if (crossOrigin) return crossOrigin

  const current = await ensureSiteAccess(siteId)
  const { data: row, error } = await serviceClient()
    .from('site_access')
    .update({ passcode_version: current.passcode_version + 1, updated_at: new Date().toISOString() })
    .eq('site_id', siteId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({ actorKind: isAdmin ? 'admin' : 'member', actorId: user.id, siteId, action: 'access.revoke_all' })
  return NextResponse.json(describeAccess(row, await getSiteById(siteId), siteOrigin(req)))
}
