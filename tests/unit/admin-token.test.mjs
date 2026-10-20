import test from 'node:test'
import assert from 'node:assert/strict'
import { SignJWT } from 'jose'

process.env.ADMIN_SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long'
process.env.ADMIN_PASSWORD = 'correct horse'

const { createAdminToken, verifyAdminToken, isAdminAuthConfigured } = await import('../../lib/server/admin-token.js')

test('a freshly issued token verifies', async () => {
  assert.equal(isAdminAuthConfigured(), true)
  assert.equal(await verifyAdminToken(await createAdminToken()), true)
})

test('the legacy literal cookie value is rejected', async () => {
  assert.equal(await verifyAdminToken('authenticated'), false)
  assert.equal(await verifyAdminToken(undefined), false)
})

test('a token signed with another secret is rejected', async () => {
  const forged = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('shb-admin')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode('some-other-secret-of-sufficient-length!!'))
  assert.equal(await verifyAdminToken(forged), false)
})

test('an expired token is rejected', async () => {
  const expired = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('shb-admin')
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
    .sign(new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET))
  assert.equal(await verifyAdminToken(expired), false)
})

test('a short secret disables admin auth (fail closed)', async () => {
  const saved = process.env.ADMIN_SESSION_SECRET
  process.env.ADMIN_SESSION_SECRET = 'short'
  assert.equal(isAdminAuthConfigured(), false)
  assert.equal(await verifyAdminToken(await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode('short'))), false)
  process.env.ADMIN_SESSION_SECRET = saved
})
