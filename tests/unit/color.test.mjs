import test from 'node:test'
import assert from 'node:assert/strict'
import { contrast, ensureContrast, mix, paletteToRoles, resolvePalette, rolesToCssVars } from '../../lib/color.js'
import { PRESET_PALETTES } from '../../lib/palettes.js'

test('mix and contrast basics', () => {
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080')
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01)
  assert.ok(contrast(ensureContrast('#bbbbbb', '#ffffff', 4.5), '#ffffff') >= 4.5)
})

test('every preset produces readable roles', () => {
  for (const preset of PRESET_PALETTES) {
    const r = paletteToRoles(preset)
    assert.ok(contrast(r.ink, r.bg) >= 7, `${preset.id} ink`)
    assert.ok(contrast(r.inkMuted, r.bg) >= 4.5, `${preset.id} muted`)
    assert.ok(contrast(r.onAccent, r.accent) >= 4.5, `${preset.id} onAccent`)
    assert.ok(contrast(r.onInverse, r.inverse) >= 7, `${preset.id} inverse`)
  }
})

test('dark palettes keep light ink', () => {
  const r = paletteToRoles({ bone: '#0f2a2b', graphite: '#f1e9d8', accent: '#c9a45c', deepAccent: '#e2c27a', warmAccent: '#d9b46a', warmGrey: '#2c4546' })
  assert.equal(r.scheme, 'dark')
  assert.ok(contrast(r.ink, r.bg) >= 7)
})

test('theme palette policies', () => {
  const theme = { palettes: [{ id: 'marble', bone: '#f8f4ea', graphite: '#1d2a24', accent: '#1f5e4a', deepAccent: '#0f3b2e', warmAccent: '#b8893b', warmGrey: '#e3d8c3' }] }
  const custom = { id: 'ai-generated', bone: '#ffffff', graphite: '#000000', accent: '#c0392b', deepAccent: '#7b241c', warmAccent: '#f5b041', warmGrey: '#dddddd' }
  assert.equal(resolvePalette({ ...theme, paletteAI: 'accents' }, { sitePalette: custom }).bg, '#f8f4ea')
  assert.equal(resolvePalette({ ...theme, paletteAI: 'full' }, { sitePalette: custom }).bg, '#ffffff')
  assert.equal(resolvePalette({ ...theme, paletteAI: 'off' }, { sitePalette: custom }).accent, paletteToRoles(theme.palettes[0]).accent)
})

test('css vars only contain hex values', () => {
  const vars = rolesToCssVars({ ...paletteToRoles(PRESET_PALETTES[0]), bg: 'red;} body{display:none' })
  assert.equal(vars['--t-bg'], undefined)
  for (const v of Object.values(vars).filter(Boolean)) assert.match(v, /^#[0-9a-f]{6}$/)
})

test("another theme's preset does not leak into this theme", () => {
  const theme = { paletteAI: 'accents', palettes: [{ id: 'marble', bone: '#f8f4ea', graphite: '#1d2a24', accent: '#1f5e4a', deepAccent: '#0f3b2e', warmAccent: '#b8893b' }] }
  const foreignPreset = { id: 'classic-elegance', bone: '#faf9f6', graphite: '#2b2b2b', accent: '#a67c52', deepAccent: '#6b2c3e', warmAccent: '#d4a574' }
  assert.equal(resolvePalette(theme, { sitePalette: foreignPreset }).accentStrong, paletteToRoles(theme.palettes[0]).accentStrong)
})

test('every theme palette produces readable roles', async () => {
  const themes = await Promise.all(
    ['cinematic', 'jharokha', 'noor', 'laal-paar', 'nakshi-kantha', 'patrika'].map((id) => import(`../../src/themes/${id}/theme.js`).then((m) => m.default))
  )
  for (const theme of themes) {
    for (const palette of theme.palettes) {
      const r = paletteToRoles(palette)
      const name = `${theme.id}/${palette.id}`
      assert.ok(contrast(r.ink, r.bg) >= 7, `${name} ink`)
      assert.ok(contrast(r.inkMuted, r.bg) >= 4.5, `${name} muted`)
      assert.ok(contrast(r.onAccent, r.accent) >= 4.5, `${name} onAccent`)
      assert.ok(contrast(r.accentStrong, r.bg) >= 4.5, `${name} accentStrong`)
      assert.ok(contrast(r.onInverse, r.inverse) >= 7, `${name} inverse`)
    }
  }
})
