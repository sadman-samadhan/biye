import { NextResponse } from 'next/server'
import { authorizeSite } from '@/lib/server/auth'
import { serviceClient } from '@/lib/server/supabase'
import { getSiteById, getSiteContent } from '@/lib/server/site-data'
import { TIME_ZONE } from '@/lib/phase'

const FIELDS = 'id, name, phone, side, attending, party_size, events, note, created_at, updated_at'

// Spreadsheet apps run cells that start with these as formulas
const csvCell = (value) => {
  let text = value == null ? '' : String(value)
  // A plain phone number like +8801… is safe and should stay readable
  if (/^[=+\-@\t\r]/.test(text) && !/^\+[\d\s()-]+$/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const dhakaTime = (iso) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

/** Replies for the couple. ?format=csv downloads them for Excel (UTF-8 with BOM so Bangla shows correctly). */
export async function GET(req, { params }) {
  const { siteId } = await params
  const { denied } = await authorizeSite(siteId)
  if (denied) return denied

  const { data, error } = await serviceClient().from('rsvps').select(FIELDS).eq('site_id', siteId).order('created_at', { ascending: false }).limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rsvps = data || []

  if (new URL(req.url).searchParams.get('format') !== 'csv') {
    return NextResponse.json({ rsvps }, { headers: { 'Cache-Control': 'private, no-store' } })
  }

  const [site, { ceremonies }] = await Promise.all([getSiteById(siteId), getSiteContent(siteId)])
  const titles = Object.fromEntries((ceremonies || []).map((c) => [c.id, c.title?.en || c.id]))
  const rows = [
    ['Name', 'Phone', 'Guest of', 'Attending', 'Guests', 'Events', 'Note', 'Replied (Dhaka time)'],
    ...rsvps.map((r) => [
      r.name,
      r.phone,
      r.side || '',
      r.attending ? 'Yes' : 'No',
      r.party_size,
      (r.events || []).map((id) => titles[id] || id).join('; '),
      r.note,
      dhakaTime(r.updated_at || r.created_at),
    ]),
  ]
  const csv = '﻿' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
  const filename = `rsvps-${site?.slug || 'site'}.csv`
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
