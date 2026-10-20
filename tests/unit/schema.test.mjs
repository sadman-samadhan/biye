import test from 'node:test'
import assert from 'node:assert/strict'
import { validateSection, validateSettings, deepSafetyIssues } from '../../lib/content/schema.js'
import { slugify, slugProblem } from '../../lib/slugs.js'

test('hero section accepts a normal payload and keeps unknown legacy keys', () => {
  const r = validateSection('hero', {
    coupleNames: { en: 'Rahim & Karima', bn: 'রহিম ও করিমা' },
    posterPath: 'https://x.supabase.co/storage/v1/object/public/site-media/a.webp',
    posterPosition: '50% 30%',
    legacyField: 'kept',
  })
  assert.equal(r.ok, true)
  assert.equal(r.data.legacyField, 'kept')
})

test('script URLs are rejected anywhere in a section', () => {
  const r = validateSection('story', {
    milestones: [{ year: '2020', title: { en: 'Hi' }, nested: { link: 'javascript:alert(1)' } }],
  })
  assert.equal(r.ok, false)
  assert.ok(r.issues.some((i) => i.message === 'Unsafe URL'))
})

test('ceremony map links must be https', () => {
  const bad = validateSection('ceremonies', [{ id: 'holud', venue: { mapUrl: 'http://evil.example' } }])
  assert.equal(bad.ok, false)
  const good = validateSection('ceremonies', [{ id: 'holud', venue: { en: 'Dhaka', mapUrl: 'https://maps.app.goo.gl/abc' } }])
  assert.equal(good.ok, true)
})

test('unknown sections are refused', () => {
  assert.equal(validateSection('status', 'live').ok, false)
})

test('prototype pollution keys are refused', () => {
  const issues = deepSafetyIssues(JSON.parse('{"a":{"__proto__":{"polluted":true}}}'))
  assert.ok(issues.length > 0)
})

test('members cannot change admin-only site fields', () => {
  const r = validateSettings({ status: 'live', slug: 'x' }, { isAdmin: false })
  assert.equal(r.ok, false)
  assert.deepEqual(r.issues.map((i) => i.path[0]).sort(), ['slug', 'status'])
})

test('palette values must be hex and are canonicalised', () => {
  const bad = validateSettings({ palette: { bone: '</style><script>' } }, { isAdmin: true })
  assert.equal(bad.ok, false)
  const good = validateSettings({ palette: { name: 'Mine', bone: '#FFF', accent: '#a67c52' } }, { isAdmin: false })
  assert.equal(good.ok, true)
  assert.deepEqual(good.data.palette, { name: 'Mine', bone: '#ffffff', accent: '#a67c52' })
})

test('slugify and slug rules', () => {
  assert.equal(slugify('Rahim & Karima'), 'rahim-and-karima')
  assert.equal(slugify('  Ünïcode__Name  '), 'unicode-name')
  assert.equal(slugProblem('rahim-and-karima'), null)
  assert.match(slugProblem('admin'), /reserved/)
  assert.ok(slugProblem('ab'))
  assert.ok(slugProblem('-bad-'))
  assert.ok(slugProblem('has_underscore'))
})
