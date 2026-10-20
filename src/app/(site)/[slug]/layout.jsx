import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import MediaGuard from '@/components/MediaGuard'
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

  const found = await getSiteForRequest(slug)
  if (!found) {
    return {
      title: 'Wedding Not Found | ShubhoBiye',
      robots: PRIVATE_ROBOTS,
    }
  }
  const { site } = found

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

  if (!(await getSiteForRequest(slug))) notFound()

  return (
    <div data-protected>
      <MediaGuard />
      {children}
    </div>
  )
}
