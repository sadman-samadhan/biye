import { notFound } from 'next/navigation'
import { getSiteContent } from '@/lib/server/site-data'
import { getSiteForRequest } from '@/lib/server/site-view'
import { resolveContentMedia } from '@/lib/server/media/resolve'
import PasscodeGate from '@/components/PasscodeGate'

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

export default async function WeddingSitePage({ params }) {
  const { slug } = await params

  // Drafts, trash and expired sites are visible to the couple and operators only
  const found = await getSiteForRequest(slug)
  if (!found) {
    notFound()
  }
  const { site, status, viewer, guest, scope, canView, publicOnlyMedia } = found

  if (!canView(scope)) {
    const { content } = await getSiteContent(site.id)
    return <PasscodeGate slug={site.slug} coupleNames={content?.hero?.coupleNames} date={content?.hero?.date} />
  }

  const siteContent = await resolveContentMedia(site.id, await getSiteContent(site.id), { publicOnly: publicOnlyMedia })
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
      {status !== 'live' && (
        <aside aria-label="Draft mode banner" className="bg-amber-500/90 text-black px-4 py-2 text-center text-xs font-medium tracking-wide sticky top-0 z-[9999] backdrop-blur-md flex items-center justify-center gap-2 shadow-md">
          <span>⚠️ <strong>{status === 'archived' ? 'In Trash' : status === 'expired' ? 'Expired' : 'Draft'}</strong> — Only you can see this site. Guests get a 404.</span>
          {viewer.isAdmin && (
            <a href={`/admin/sites/${site.id}`} className="underline font-bold ml-2 hover:opacity-80">
              Open in Admin →
            </a>
          )}
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
              <CinematicGallery images={gallery} viewerName={guest?.name || null} />
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
            <MessageBoard slug={site.slug} />
          </div>
        )}
      </main>

      <Footer
        footerData={footerData}
        siteName={coupleNames}
        contactEmail={site.public_contact?.email}
        contactPhone={site.public_contact?.whatsapp || site.public_contact?.phone}
      />
    </>
  )
}
