import { notFound } from 'next/navigation'
import { getSiteBySlug, getSiteContent } from '@/lib/getData'

import Navigation from '@/components/Navigation'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'
import VideoHero from '@/components/VideoHero'
import SectionDivider from '@/components/SectionDivider'
import StoryTimeline from '@/components/StoryTimeline'
import BrideReveal from '@/components/BrideReveal'
import LogoReveal from '@/components/LogoReveal'
import CeremonySection from '@/components/CeremonySection'
import CinematicGallery from '@/components/CinematicGallery'
import DuasSection from '@/components/DuasSection'
import MessageBoard from '@/components/MessageBoard'
import Footer from '@/components/Footer'

export default async function WeddingSitePage({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const isPreview = resolvedSearch?.preview === 'true'
  const slug = resolvedParams?.slug

  const site = await getSiteBySlug(slug, isPreview)
  if (!site) {
    notFound()
  }

  const siteContent = await getSiteContent(site.id)
  const heroData = siteContent?.content?.hero
  const storyData = siteContent?.content?.story
  const brideRevealData = siteContent?.content?.brideReveal
  const ceremonies = siteContent?.ceremonies || []
  const gallery = siteContent?.gallery || []
  const duasData = siteContent?.duas || { duas: [], parentBlessings: {} }
  const footerData = siteContent?.content?.footer

  const coupleNames = heroData?.coupleNames?.en || site.owner_name || 'Our Wedding'

  return (
    <>
      {site.status === 'draft' && (
        <aside aria-label="Draft mode banner" className="bg-amber-500/90 text-black px-4 py-2 text-center text-xs font-medium tracking-wide sticky top-0 z-[9999] backdrop-blur-md flex items-center justify-center gap-2 shadow-md">
          <span>⚠️ <strong>Draft Mode</strong> — This wedding site is currently not published live.</span>
          <a href={`/admin/sites/${site.id}`} className="underline font-bold ml-2 hover:opacity-80">
            Publish Live in Admin →
          </a>
        </aside>
      )}
      <Navigation heroData={heroData} ceremonies={ceremonies.filter(c => c.enabled !== false)} />
      <ScrollProgress />
      <BackToTop />

      <main>
        {/* HERO SECTION */}
        <div id="home">
          <VideoHero heroData={heroData} weddingType={site.wedding_type || 'muslim'} />
        </div>

        <SectionDivider variant="ornament" />

        {/* STORY SECTION */}
        {siteContent?.content?.sectionToggles?.story !== false && storyData && storyData.milestones?.length > 0 && (
          <>
            <div id="story">
              <StoryTimeline storyData={storyData} />
            </div>
            <SectionDivider variant="line" accentColor="clay" />
          </>
        )}

        {/* BRIDE REVEAL / COUPLE SPOTLIGHT */}
        {siteContent?.content?.sectionToggles?.spotlight !== false && brideRevealData && (
          <div className="relative">
            <BrideReveal brideRevealData={brideRevealData} />
          </div>
        )}

        {/* MONOGRAM / LOGO REVEAL */}
        {siteContent?.content?.sectionToggles?.monogram !== false && (
          <LogoReveal 
            logoUrl={siteContent?.content?.logoUrl} 
            coupleNames={coupleNames} 
            blessingData={heroData?.blessing || siteContent?.content?.blessing}
            weddingType={site.wedding_type || 'muslim'}
          />
        )}

        {/* DYNAMIC CEREMONIES */}
        {siteContent?.content?.sectionToggles?.ceremonies !== false && ceremonies.filter(c => c.enabled !== false).map((ceremony, index) => {
          const dividerAccents = ['clay', 'saffron', 'deep-wine', 'terracotta']
          const accent = dividerAccents[index % dividerAccents.length]

          return (
            <div key={ceremony.id || `ceremony-${index}`}>
              <SectionDivider variant="ornament" accentColor={accent} />
              <div id={ceremony.id}>
                <CeremonySection ceremony={ceremony} />
              </div>
            </div>
          )
        })}

        <SectionDivider variant="ornament" />

        {/* GALLERY SECTION */}
        {siteContent?.content?.sectionToggles?.gallery !== false && gallery && gallery.length > 0 && (
          <>
            <div id="gallery">
              <CinematicGallery images={gallery} />
            </div>
            <SectionDivider variant="line" />
          </>
        )}

        {/* DUAS & BLESSINGS SECTION */}
        {siteContent?.content?.sectionToggles?.blessings !== false && duasData && (
          <>
            <div id="duas">
              <DuasSection duasData={duasData} />
            </div>
            <SectionDivider variant="text" />
          </>
        )}

        {/* MESSAGES SECTION */}
        {siteContent?.content?.sectionToggles?.messages !== false && (
          <div id="messages">
            <MessageBoard siteId={site.id} />
          </div>
        )}
      </main>

      <Footer
        footerData={footerData}
        siteName={coupleNames}
        ownerEmail={site.owner_email}
        ownerPhone={site.owner_phone}
      />
    </>
  )
}
