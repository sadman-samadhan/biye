import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePalette, toHexColor, DEFAULT_PALETTE } from '../../lib/palettes.js'

test('toHexColor accepts 3 and 6 digit hex and canonicalises', () => {
  assert.equal(toHexColor('#ABC'), '#aabbcc')
  assert.equal(toHexColor(' #A1b2C3 '), '#a1b2c3')
})

test('toHexColor rejects anything that is not a hex color', () => {
  for (const bad of ['red', '#12345', '#1234567', 'rgb(0,0,0)', '#fff;}</style><script>', null, 42, {}]) {
    assert.equal(toHexColor(bad), null, String(bad))
  }
})

test('normalizePalette replaces injected CSS with defaults', () => {
  const p = normalizePalette({
    bone: '#fff}</style><script>alert(1)</script>',
    accent: 'url(javascript:alert(1))',
    deepAccent: '#123456',
  })
  assert.equal(p.bone, DEFAULT_PALETTE.bone)
  assert.equal(p.accent, DEFAULT_PALETTE.accent)
  assert.equal(p.deepAccent, '#123456')
  for (const value of Object.values(p).filter((v) => v !== p.name)) {
    assert.match(value, /^#[0-9a-f]{6}$/i)
  }
})

test('normalizePalette enforces readable text on the background', () => {
  const p = normalizePalette({ bone: '#ffffff', graphite: '#eeeeee' })
  assert.equal(p.graphite, '#1F1F1F')
})
