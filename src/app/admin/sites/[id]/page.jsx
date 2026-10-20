import SiteEditor from '@/components/editor/SiteEditor'

export const metadata = { title: 'Edit site | ShubhoBiye' }

export default async function EditSitePage({ params }) {
  const { id } = await params
  return <SiteEditor siteId={id} mode="admin" />
}
