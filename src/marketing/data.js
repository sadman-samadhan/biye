import { THEME_LIST } from '@/themes/registry'
import { TRADITIONS } from '@/traditions'
import { DEMO_TRADITIONS } from '@/demo/packs'

/** Plain data the marketing pages hand to client components. */
export function themeCards() {
  return THEME_LIST.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    recommendedFor: t.recommendedFor,
    mood: t.mood,
    palettes: t.palettes.map((p) => ({ id: p.id, name: p.name, bone: p.bone, accent: p.accent, warmAccent: p.warmAccent, deepAccent: p.deepAccent })),
    demoTradition: t.recommendedFor[0] || 'universal',
  }))
}

export function traditionList() {
  return DEMO_TRADITIONS.map((id) => ({ id, label: TRADITIONS[id]?.label || { en: id, bn: '' } }))
}
