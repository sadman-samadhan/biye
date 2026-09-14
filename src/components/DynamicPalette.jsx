import { normalizePalette } from '@/lib/palettes'

/**
 * DynamicPalette Component
 * Injects CSS custom properties into :root to override Tailwind theme colors
 * based on the wedding site's chosen color palette.
 */
export default function DynamicPalette({ palette }) {
  const p = normalizePalette(palette)

  const css = `
    :root {
      --color-bone: ${p.bone};
      --color-graphite: ${p.graphite};
      --color-warm-grey: ${p.warmGrey};
      --color-clay: ${p.accent};
      --color-deep-wine: ${p.deepAccent};
      --color-saffron: ${p.warmAccent};
    }
  `

  return (
    <style
      id="amarbiye-dynamic-palette"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
