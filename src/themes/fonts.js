import {
  Amiri,
  Cormorant_Garamond,
  EB_Garamond,
  Galada,
  Hind_Siliguri,
  Inter,
  Marcellus,
  Tiro_Bangla,
  Tiro_Devanagari_Sanskrit,
} from 'next/font/google'

/**
 * Every typeface a theme can use, declared once (next/font needs static calls).
 * Only the wedding-site layout applies these variables, and fonts are not
 * preloaded, so a page downloads only the families its theme actually uses.
 */
const cormorant = Cormorant_Garamond({ weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], subsets: ['latin', 'latin-ext'], variable: '--ff-cormorant', display: 'swap', preload: false })
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--ff-inter', display: 'swap', preload: false })
const marcellus = Marcellus({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--ff-marcellus', display: 'swap', preload: false })
const ebGaramond = EB_Garamond({ weight: ['400', '500', '600'], style: ['normal', 'italic'], subsets: ['latin', 'latin-ext'], variable: '--ff-ebgaramond', display: 'swap', preload: false })
const amiri = Amiri({ weight: ['400', '700'], subsets: ['arabic', 'latin'], variable: '--ff-amiri', display: 'swap', preload: false })
const tiroBangla = Tiro_Bangla({ weight: '400', style: ['normal', 'italic'], subsets: ['bengali', 'latin'], variable: '--ff-tirobangla', display: 'swap', preload: false })
const galada = Galada({ weight: '400', subsets: ['bengali', 'latin'], variable: '--ff-galada', display: 'swap', preload: false })
const hindSiliguri = Hind_Siliguri({ weight: ['400', '500', '600'], subsets: ['bengali', 'latin'], variable: '--ff-hindsiliguri', display: 'swap', preload: false })
const tiroSanskrit = Tiro_Devanagari_Sanskrit({ weight: '400', subsets: ['devanagari', 'latin'], variable: '--ff-tirosanskrit', display: 'swap', preload: false })

export const themeFontVariables = [cormorant, inter, marcellus, ebGaramond, amiri, tiroBangla, galada, hindSiliguri, tiroSanskrit]
  .map((font) => font.variable)
  .join(' ')

/** Font key → CSS font-family stack (with system fallbacks). */
export const FONT_STACKS = {
  cormorant: "var(--ff-cormorant), 'Cormorant Garamond', Georgia, serif",
  inter: "var(--ff-inter), 'Segoe UI', system-ui, sans-serif",
  marcellus: "var(--ff-marcellus), 'Trajan Pro', Georgia, serif",
  ebgaramond: "var(--ff-ebgaramond), Garamond, Georgia, serif",
  amiri: "var(--ff-amiri), 'Traditional Arabic', 'Noto Naskh Arabic', serif",
  tirobangla: "var(--ff-tirobangla), 'Noto Serif Bengali', 'Nirmala UI', serif",
  galada: "var(--ff-galada), var(--ff-tirobangla), 'Noto Serif Bengali', serif",
  hindsiliguri: "var(--ff-hindsiliguri), 'Noto Sans Bengali', 'Nirmala UI', sans-serif",
  tirosanskrit: "var(--ff-tirosanskrit), 'Noto Serif Devanagari', 'Mangal', serif",
}
