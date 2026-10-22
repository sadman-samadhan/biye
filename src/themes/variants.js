import { NoorCeremony, NoorGallery, NoorHero, NoorSpotlight, NoorStory } from './noor/sections'
import { AlponaHero, PaanStory, PaarCeremony, PaarFrame, PaarGallery, ShankhaSpotlight } from './laal-paar/sections'
import { PatchCeremony, PatchSpotlight, QuiltGallery, QuiltHero, StitchStory, ThreadFrame } from './nakshi-kantha/sections'
import { ChapterCeremony, CoverHero, FeatureStory, FolioFrame, PullquoteSpotlight, SpreadGallery } from './patrika/sections'

/**
 * Section layouts contributed by themes, keyed by section then variant id.
 * The shared sections (src/site/sections/*) look a theme's variant up here
 * first, so a new theme adds layouts without touching them.
 */
export const THEME_VARIANTS = {
  hero: { noor: NoorHero, alpona: AlponaHero, quilt: QuiltHero, cover: CoverHero },
  story: { noor: NoorStory, paan: PaanStory, stitch: StitchStory, feature: FeatureStory },
  spotlight: { quote: NoorSpotlight, shankha: ShankhaSpotlight, patch: PatchSpotlight, pullquote: PullquoteSpotlight },
  ceremony: { lantern: NoorCeremony, paar: PaarCeremony, patch: PatchCeremony, chapter: ChapterCeremony },
  gallery: { dome: NoorGallery, prints: PaarGallery, quilt: QuiltGallery, spreads: SpreadGallery },
}

/** Page-level decoration a theme draws around everything (theme.frame). */
export const THEME_FRAMES = { paar: PaarFrame, thread: ThreadFrame, folio: FolioFrame }
