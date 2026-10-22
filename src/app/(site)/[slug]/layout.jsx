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
  const { site, access } = found

  const content = await getSiteContent(site.id)
  const coupleNames = content?.content?.hero?.coupleNames?.en || site.owner_name || 'Wedding Celebration'
  // Link previews are seen by anyone holding the link, so the date only shows when the invitation is public
  const invitePublic = !access || access.invite_access === 'public' || !access.passcode_enc
  const date = invitePublic ? content?.content?.hero?.date?.en || '' : ''
  const description = `You are invited to the wedding of ${coupleNames}.${date ? ` ${date}` : ''}`
  const stamp = Math.max(new Date(site.updated_at || 0).getTime(), new Date(access?.updated_at || 0).getTime())
  const card = `/${site.slug}/og.jpg?v=${content.version || 1}-${stamp}`

  return {
    title: `${coupleNames} | Wedding`,
    description,
    robots: PRIVATE_ROBOTS,
    openGraph: {
      title: `${coupleNames} — Wedding Invitation`,
      description,
      type: 'website',
      images: [{ url: card, width: 1200, height: 630, alt: `${coupleNames} wedding invitation` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${coupleNames} — Wedding Invitation`,
      description,
      images: [card],
    },
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
