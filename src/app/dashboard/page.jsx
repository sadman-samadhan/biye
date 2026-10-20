import Link from 'next/link'
import { requireUserPage } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'

const STATUS_LABEL = {
  live: { text: 'Live', className: 'bg-[#E4F1E7] text-[#22603A]' },
  draft: { text: 'Draft', className: 'bg-[#FBEFD6] text-[#8A5A08]' },
  expired: { text: 'Expired', className: 'bg-[#F3E4E5] text-[#7A2229]' },
  archived: { text: 'In trash', className: 'bg-[#ECE7E1] text-[#6B625A]' },
}

async function getMySites(userId) {
  if (!isSupabaseConfigured()) return []
  const { data } = await serviceClient()
    .from('site_members')
    .select('role, sites ( id, slug, status, products, plan_expiry_date )')
    .eq('user_id', userId)
  return (data || []).filter((row) => row.sites).map((row) => ({ role: row.role, ...row.sites }))
}

export default async function DashboardHome() {
  const user = await requireUserPage('/dashboard')
  const sites = await getMySites(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Your wedding sites</h1>
        <p className="mt-1 text-[#6B625A]">Edit details, manage photos and see who has RSVP’d.</p>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9CDBB] bg-white/60 p-8 text-[#6B625A]">
          <p className="font-medium text-[#1E1A17]">No sites are linked to {user.email} yet.</p>
          <p className="mt-1 text-sm">
            If you’ve ordered a site, ask us on WhatsApp to add this email address to it.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {sites.map((site) => {
            const status = STATUS_LABEL[site.status] || STATUS_LABEL.draft
            return (
              <li key={site.id} className="rounded-2xl border border-[#E8DFD2] bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-semibold">{site.slug}</p>
                    <p className="mt-0.5 text-sm text-[#6B625A]">
                      {site.role === 'owner' ? 'Owner' : 'Editor'}
                      {site.plan_expiry_date && ` · until ${new Date(site.plan_expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.text}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <Link href={`/${site.slug}`} className="rounded-lg border border-[#E2D8C9] px-3 py-1.5 hover:bg-[#FBF6EE]">
                    View site
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
