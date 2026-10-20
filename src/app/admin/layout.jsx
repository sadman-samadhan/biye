import AdminShell from '@/components/admin/AdminShell'
import { requireAdminPage } from '@/lib/server/auth'

export const metadata = {
  title: 'Admin | ShubhoBiye',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }) {
  const user = await requireAdminPage('/admin')
  return <AdminShell email={user.email}>{children}</AdminShell>
}
