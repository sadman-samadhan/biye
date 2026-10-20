import { getSiteBySlug, getSiteContent } from '@/lib/getData'
import { isAdminRequest } from '@/lib/server/admin-session'
import DynamicPalette from '@/components/DynamicPalette'
import CustomCursor from '@/components/CustomCursor'
import { notFound } from 'next/navigation'

// Couples' sites are private by default: never indexed, no image search, no snippets.
const PRIVATE_ROBOTS = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
}

export async function generateMetadata({ params }) {
  const { slug } = await params

  const site = await getSiteBySlug(slug, await isAdminRequest())
  if (!site) {
    return {
      title: 'Wedding Not Found | AmarBiye',
      robots: PRIVATE_ROBOTS,
    }
  }

  const content = await getSiteContent(site.id)
  const coupleNames = content?.content?.hero?.coupleNames?.en || site.owner_name || 'Wedding Celebration'
  const date = content?.content?.hero?.date?.en || ''

  return {
    title: `${coupleNames} | Wedding Celebration`,
    description: `Join us in celebrating the wedding of ${coupleNames}. ${date}`,
    robots: PRIVATE_ROBOTS,
    openGraph: {
      title: `${coupleNames} — Our Wedding`,
      description: `Join us in celebrating our wedding. ${date}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${coupleNames} — Our Wedding`,
      description: `Join us in celebrating our wedding. ${date}`
    }
  }
}

export default async function WeddingSiteLayout({ children, params }) {
  const { slug } = await params

  const site = await getSiteBySlug(slug, await isAdminRequest())
  if (!site) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-bone text-graphite antialiased transition-colors duration-500 selection:bg-clay selection:text-white">
      <CustomCursor />
      <DynamicPalette palette={site.palette} />
      {children}
    </div>
  )
}
