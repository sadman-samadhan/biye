import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import { deleteMediaRows } from '@/lib/server/media/gc'

/**
 * Daily housekeeping, called by Vercel Cron with "Authorization: Bearer $CRON_SECRET":
 *   - forget rate-limit counters older than a day (the longest window is an hour)
 *   - remove uploads that started but never finished (older than a day)
 *   - the queries themselves keep a free Supabase project from pausing
 */

function authorized(req) {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16) return false
  const given = Buffer.from(req.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export async function GET(req) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })

  const supabase = serviceClient()
  const dayAgo = new Date(Date.now() - 86400000).toISOString()
  const report = {}

  const { count: rateLimits, error: rlError } = await supabase.from('rate_limits').delete({ count: 'exact' }).lt('window_start', dayAgo)
  report.rateLimitsRemoved = rlError ? `error: ${rlError.message}` : rateLimits || 0

  const { data: stuck, error: stuckError } = await supabase
    .from('media')
    .select('id, site_id, storage_key, variants, bytes_total')
    .eq('status', 'pending')
    .lt('created_at', dayAgo)
    .limit(500)
  if (stuckError) {
    report.stuckUploads = `error: ${stuckError.message}`
  } else {
    const bySite = new Map()
    for (const row of stuck || []) bySite.set(row.site_id, [...(bySite.get(row.site_id) || []), row])
    let removed = 0
    for (const [siteId, rows] of bySite) {
      try {
        await deleteMediaRows(siteId, rows)
        removed += rows.length
      } catch (err) {
        console.warn('[cron] stuck uploads', siteId, err.message)
      }
    }
    report.stuckUploadsRemoved = removed
  }

  const { count: sites } = await supabase.from('sites').select('id', { count: 'exact', head: true })
  report.sites = sites || 0
  console.log('[cron daily]', JSON.stringify(report))
  return NextResponse.json({ ok: true, ...report }, { headers: { 'Cache-Control': 'no-store' } })
}
