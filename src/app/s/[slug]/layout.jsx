import { getSiteBySlug, getSiteContent } from '@/lib/getData'
import DynamicPalette from '@/components/DynamicPalette'
import CustomCursor from '@/components/CustomCursor'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const isPreview = resolvedSearch?.preview === 'true'
  const slug = resolvedParams?.slug

  const site = await getSiteBySlug(slug, isPreview)
  if (!site) {
    return {
      title: 'Wedding Not Found | AmarBiye',
      description: 'The requested wedding celebration could not be found.'
    }
  }

  const content = await getSiteContent(site.id)
  const coupleNames = content?.content?.hero?.coupleNames?.en || site.owner_name || 'Wedding Celebration'
  const date = content?.content?.hero?.date?.en || ''

  return {
    title: `${coupleNames} | Wedding Celebration`,
    description: `Join us in celebrating the wedding of ${coupleNames}. ${date}`,
    openGraph: {
      title: `${coupleNames} — Our Wedding`,
      description: `Join us in celebrating our wedding. ${date}`,
      type: 'website',
      images: [
        {
          url: content?.content?.hero?.posterPath 
            ? `/images/${content.content.hero.posterPath}` 
            : '/wedding-logo.png',
          width: 1200,
          height: 630,
          alt: coupleNames
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${coupleNames} — Our Wedding`,
      description: `Join us in celebrating our wedding. ${date}`
    }
  }
}

export default async function WeddingSiteLayout({ children, params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const isPreview = resolvedSearch?.preview === 'true'
  const slug = resolvedParams?.slug

  const site = await getSiteBySlug(slug, isPreview)
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
