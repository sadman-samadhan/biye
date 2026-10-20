import test from 'node:test'
import assert from 'node:assert/strict'
import { computePhase, dhakaDay, eventWindow } from '../../lib/phase.js'
import { generatePasscode, normalizePasscode, passcodeProblem } from '../../lib/passcode.js'

const ceremonies = [
  { id: 'holud', startsAt: '2026-12-10T18:00:00+06:00' },
  { id: 'biye', startsAt: '2026-12-12T19:30:00+06:00' },
  { id: 'hidden', startsAt: '2026-12-20T19:30:00+06:00', enabled: false },
]
const both = ['invite', 'site']

test('Dhaka calendar day differs from UTC around midnight', () => {
  // 20:00 UTC on the 9th is 02:00 on the 10th in Dhaka
  assert.equal(dhakaDay(new Date('2026-12-09T20:00:00Z')), '2026-12-10')
})

test('event window ignores hidden ceremonies', () => {
  assert.deepEqual(eventWindow(ceremonies), { first: '2026-12-10', last: '2026-12-12' })
})

test('invitation → live → memories', () => {
  const at = (iso, extra = {}) => computePhase({ products: both, ceremonies, now: new Date(iso), ...extra })
  assert.equal(at('2026-12-01T12:00:00+06:00'), 'invitation')
  assert.equal(at('2026-12-10T00:30:00+06:00'), 'live')
  assert.equal(at('2026-12-13T23:00:00+06:00'), 'live', 'day after the last event stays live')
  assert.equal(at('2026-12-15T10:00:00+06:00'), 'live', 'memories wait until the couple publishes')
  assert.equal(at('2026-12-15T10:00:00+06:00', { memoriesPublished: true }), 'memories')
})

test('product limits the phases', () => {
  const late = new Date('2027-01-10T10:00:00+06:00')
  assert.equal(computePhase({ products: ['site'], ceremonies, now: new Date('2026-12-01') }), 'memories')
  assert.equal(computePhase({ products: ['invite'], ceremonies, now: late, memoriesPublished: true }), 'live')
})

test('override wins only when the product allows it', () => {
  assert.equal(computePhase({ products: both, ceremonies, phaseOverride: 'memories', now: new Date('2026-12-01') }), 'memories')
  assert.equal(computePhase({ products: ['invite'], ceremonies, phaseOverride: 'memories', now: new Date('2026-12-01') }), 'invitation')
})

test('no dated events yet: invitation until memories are published', () => {
  assert.equal(computePhase({ products: both, ceremonies: [{ id: 'x' }] }), 'invitation')
  assert.equal(computePhase({ products: both, ceremonies: [], memoriesPublished: true }), 'memories')
})

test('passcode normalisation is forgiving', () => {
  assert.equal(normalizePasscode('  Shapla - ৪৮২১ '), 'shapla-4821')
  assert.equal(normalizePasscode('SHAPLA-4821'), normalizePasscode('shapla-4821'))
  assert.match(passcodeProblem('abc'), /at least 6/)
  assert.equal(passcodeProblem('shapla-4821'), null)
})

test('generated passcodes look like flower-1234', () => {
  let n = 0
  const code = generatePasscode((max) => (n++ * 7) % max)
  assert.match(code, /^[a-z]+-\d{4}$/)
})
