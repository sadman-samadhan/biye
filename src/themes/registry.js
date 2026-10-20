import cinematic from './cinematic/theme.js'
import jharokha from './jharokha/theme.js'

/** All themes. Order here is the order pickers show them in. */
export const THEMES = { cinematic, jharokha }

const ALIASES = { classic: 'cinematic' }

export function getTheme(id) {
  return THEMES[ALIASES[id] || id] || THEMES.cinematic
}

/** Lightweight list for pickers (no palettes' internals needed beyond swatches). */
export const THEME_LIST = Object.values(THEMES).map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  recommendedFor: t.recommendedFor,
  mood: t.mood || [],
  palettes: t.palettes,
}))

/** Themes ordered for a tradition: the ones designed for it first. */
export function themesForTradition(traditionId) {
  return [...THEME_LIST].sort((a, b) => Number(b.recommendedFor.includes(traditionId)) - Number(a.recommendedFor.includes(traditionId)))
}
