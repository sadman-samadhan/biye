import { FONT_STACKS, themeFontVariables } from '@/themes/fonts'
import { ShapeDefs } from '@/themes/ornaments'
import { resolvePalette, rolesToCssVars } from '@/lib/color'
import ThemeRuntime from './ThemeRuntime'

/**
 * Applies a theme to everything inside it: colour roles and font roles as CSS
 * variables (consumed by bg-t-*, text-t-*, font-t-* utilities). Values are
 * validated hex colours and fixed font stacks, so nothing user-supplied is
 * injected as raw CSS.
 */
export default function ThemeRoot({ theme, sitePalette, paletteId, children, className = '' }) {
  const roles = resolvePalette(theme, { sitePalette, paletteId })
  const style = {
    ...rolesToCssVars(roles),
    '--t-font-display': FONT_STACKS[theme.fonts.display],
    '--t-font-body': FONT_STACKS[theme.fonts.body],
    '--t-font-bn': FONT_STACKS[theme.fonts.bn],
    '--t-font-bn-display': FONT_STACKS[theme.fonts.bnDisplay],
    '--t-font-ar': FONT_STACKS[theme.fonts.ar],
    '--t-font-sa': FONT_STACKS[theme.fonts.sa],
    '--t-radius': theme.shape.radius,
    '--t-display-tracking': theme.type.displayTracking,
    colorScheme: roles.scheme,
  }

  return (
    <div
      data-theme={theme.id}
      data-scheme={roles.scheme}
      data-display-case={theme.type.displayCase}
      style={style}
      className={`${themeFontVariables} min-h-screen bg-t-bg font-t-body text-t-ink antialiased selection:bg-t-accent selection:text-t-on-accent ${className}`}
    >
      <ShapeDefs />
      <ThemeRuntime>{children}</ThemeRuntime>
    </div>
  )
}
