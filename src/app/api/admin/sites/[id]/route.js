import { NextResponse } from 'next/server'
import { assertSameOrigin, getCurrentUser, requireAdmin } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { writeAudit } from '@/lib/server/site-data'
import { keys, storage } from '@/lib/server/storage'
import { deleteLegacySiteStorage } from '@/lib/server/legacy-storage'

const notConfigured = () => NextResponse.json({ error: 'Database is not configured' }, { status: 503 })

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
    await storage().removePrefix(keys.siteRoot(site.id))
    await storage().removePrefix(`tmp/${site.id}/`)
    await deleteLegacySiteStorage(site.id, site.slug)
  } catch (storageErr) {
    console.error('[DELETE site] storage purge failed:', storageErr)
    return NextResponse.json({ error: 'Could not purge stored media; nothing was deleted.' }, { status: 500 })
  }

  const { error: deleteError } = await supabase.from('sites').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  await writeAudit({ actorKind: 'admin', actorId: user?.id, siteId: null, action: 'site.purge', meta: { id, slug: site.slug } })
  return NextResponse.json({ success: true, permanent: true, message: 'Site and all its media were permanently deleted.' })
}
