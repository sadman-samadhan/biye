import { requireAdminPage } from '@/lib/server/auth'
import { isSupabaseConfigured, serviceClient } from '@/lib/server/supabase'
import SitesTable from './SitesTable'

export const metadata = { title: 'All sites | ShubhoBiye admin' }

export default async function AdminSitesPage() {
  await requireAdminPage('/admin/sites')
  let sites = []
  if (isSupabaseConfigured()) {
    const { data } = await serviceClient()
      .from('sites')
      .select('id, slug, status, owner_name, owner_phone, products, plan, plan_expiry_date, palette, created_at')
      .order('created_at', { ascending: false })
    sites = data || []
  }
  return <SitesTable sites={sites} />
}
