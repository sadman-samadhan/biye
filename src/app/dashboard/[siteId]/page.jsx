import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SiteEditor from '@/components/editor/SiteEditor'
import { getSiteRole, requireUserPage } from '@/lib/server/auth'

export const metadata = { title: 'Your wedding site | ShubhoBiye' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The couple's editor for one site. Operators get the full console at /admin. */
export default async function CoupleSitePage({ params }) {
  const { siteId } = await params
  await requireUserPage(`/dashboard/${siteId}`)
  if (!UUID.test(siteId) || !(await getSiteRole(siteId))) notFound()

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#6B625A] hover:text-[#1E1A17]">
        <ArrowLeft size={15} /> Your sites
      </Link>
      <SiteEditor siteId={siteId} mode="couple" />
    </div>
  )
}
