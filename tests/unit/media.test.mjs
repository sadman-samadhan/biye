import test from 'node:test'
import assert from 'node:assert/strict'
import { AwsClient } from 'aws4fetch'
import { collectMediaIds, mapMediaTokens, mediaIdOf, toMediaToken } from '../../lib/media-ref.js'
import { flooredAmzDate, presignR2 } from '../../lib/server/storage/r2-sign.js'
import { planLimits, formatBytes } from '../../lib/plans.js'
import { validateSection } from '../../lib/content/schema.js'

const A = '3cd6cdab-ba36-4644-82b4-57a2bf8534e5'
const B = '94e781dd-995d-48ee-b896-2735417beb6c'

test('media tokens are recognised only in the exact form', () => {
  assert.equal(mediaIdOf(toMediaToken(A)), A)
  assert.equal(mediaIdOf(`xmedia:${A}`), null)
  assert.equal(mediaIdOf(`media:${A}x`), null)
  assert.equal(mediaIdOf('https://example.com/a.jpg'), null)
})

test('collect and map tokens through nested content', () => {
  const content = { hero: { posterPath: `media:${A}` }, gallery: [{ filename: `media:${B}` }, { filename: '/images/legacy.jpg' }], note: 'media: not a token' }
  assert.deepEqual([...collectMediaIds(content)].sort(), [A, B].sort())
  const mapped = mapMediaTokens(content, (id) => `signed://${id}`)
  assert.equal(mapped.hero.posterPath, `signed://${A}`)
  assert.equal(mapped.gallery[1].filename, '/images/legacy.jpg')
  assert.equal(content.hero.posterPath, `media:${A}`, 'input is not mutated')
})

test('content schema accepts media tokens as image references', () => {
  const r = validateSection('hero', { posterPath: `media:${A}`, posterPosition: '50% 30%' })
  assert.equal(r.ok, true)
})

test('R2 signing date is floored to the hour', () => {
  assert.equal(flooredAmzDate(new Date('2026-10-20T13:47:12.345Z')), '20261020T130000Z')
})

test('R2 presigned GET URLs are identical within the same hour (browser-cacheable)', async () => {
  const client = new AwsClient({ accessKeyId: 'AKIAEXAMPLE', secretAccessKey: 'secret', service: 's3', region: 'auto' })
  const url = 'https://acct.r2.cloudflarestorage.com/bucket/sites/x/m/y/web.webp'
  const datetime = flooredAmzDate(new Date('2026-10-20T13:05:00Z'))
  const a = await presignR2(client, url, { ttl: 10800, datetime })
  const b = await presignR2(client, url, { ttl: 10800, datetime: flooredAmzDate(new Date('2026-10-20T13:55:00Z')) })
  assert.equal(a, b)
  assert.match(a, /X-Amz-Signature=[0-9a-f]{64}/)
  const c = await presignR2(client, url, { ttl: 10800, datetime: flooredAmzDate(new Date('2026-10-20T14:01:00Z')) })
  assert.notEqual(a, c)
})

test('plan limits and storage overrides', () => {
  assert.equal(planLimits({ plan: 'invitation' }).photos, 40)
  assert.equal(planLimits({ plan: 'unknown' }).photos, 300)
  assert.equal(planLimits({ plan: 'standard', storage_quota_bytes: 123 }).storageBytes, 123)
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB')
})
