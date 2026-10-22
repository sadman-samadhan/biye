import { test, expect } from '@playwright/test'
import { OPERATOR, panel, signIn, testPhoto, uniqueSlug } from './helpers.mjs'

test('a couple accepts the invite, edits their own site and downloads their photos', async ({ page, browser }) => {
  await signIn(page, OPERATOR)
  const slug = uniqueSlug('couple')
  const email = `${slug}@example.com`

  const make = async (s) => {
    const res = await page.request.post('/api/admin/sites', {
      data: { slug: s, status: 'live', wedding_type: 'universal', products: ['invite', 'site'], content: { hero: { coupleNames: { en: 'Mira & Sami', bn: 'মীরা ও সামি' } } } },
    })
    expect(res.ok()).toBeTruthy()
    return (await res.json()).site
  }
  const site = await make(slug)
  const otherSite = await make(`${slug}-other`)

  // The operator creates the invite link (sent on WhatsApp in real life)
  const invite = await page.request.post(`/api/admin/sites/${site.id}/members`, { data: { email } })
  expect(invite.ok()).toBeTruthy()
  const { link } = await invite.json()

  // The couple opens it, sets a password and lands in their editor
  const couple = await browser.newContext()
  const c = await couple.newPage()
  await c.goto(new URL(link).pathname + new URL(link).search)
  await c.waitForURL(/\/dashboard\/set-password/)
  await c.getByLabel('New password').fill('a-long-couple-password')
  await c.getByLabel('Type it again').fill('a-long-couple-password')
  await c.getByRole('button', { name: 'Save password' }).click()
  await c.waitForURL(new RegExp(`/dashboard/${site.id}`))
  await expect(c.getByRole('heading', { level: 1 })).toContainText('Mira & Sami')

  // Couples don't get the operator panels
  const nav = c.getByRole('navigation', { name: 'Editor sections' })
  await expect(nav.getByRole('button', { name: 'Site settings' })).toHaveCount(0)
  await expect(nav.getByRole('button', { name: 'Couple access' })).toHaveCount(0)

  // Upload a photo to the gallery, then find it under "Your photos" with a full-size download
  await nav.getByRole('button', { name: 'Gallery' }).click()
  const gallery = panel(c, 'Gallery')
  await gallery.locator('input[type=file]').setInputFiles([await testPhoto('ours.jpg', 120)])
  await expect(gallery.getByRole('listitem')).toHaveCount(1, { timeout: 60_000 })
  await gallery.getByRole('button', { name: 'Save changes' }).click()
  await expect(c.getByText('Gallery saved')).toBeVisible()

  await nav.getByRole('button', { name: 'Your photos' }).click()
  const photos = panel(c, 'Your photos')
  await expect(photos.getByRole('listitem')).toHaveCount(1)
  await expect(photos.getByText(/1 of \d+ photos/)).toBeVisible()
  const links = await c.request.post(`/api/sites/${site.id}/media/download-links`, { data: {}, headers: { origin: new URL(c.url()).origin } })
  const { files } = await links.json()
  expect(files).toHaveLength(1)
  const full = await c.request.get(files[0].url)
  expect(full.ok()).toBeTruthy()
  expect(full.headers()['content-type']).toContain('image/jpeg')

  // Download all → a real .zip
  const [download] = await Promise.all([c.waitForEvent('download'), photos.getByRole('button', { name: 'Download all' }).click()])
  expect(download.suggestedFilename()).toBe(`${slug}-photos.zip`)

  // Publishing the full site is the couple's call
  await nav.getByRole('button', { name: 'Privacy & sharing' }).click()
  await c.getByRole('switch', { name: 'Show the full site after the wedding' }).click()
  await expect(c.getByText('Full site published')).toBeVisible()

  // …but someone else's site stays closed
  expect((await c.goto(`/dashboard/${otherSite.id}`)).status()).toBe(404)
  expect((await c.request.get(`/api/sites/${otherSite.id}`)).status()).toBe(404)
  expect((await c.request.get(`/api/sites/${otherSite.id}/rsvps`)).status()).toBe(404)
  expect((await c.request.patch(`/api/sites/${site.id}/settings`, { data: { status: 'draft' }, headers: { origin: new URL(c.url()).origin } })).status()).toBe(400)
  await couple.close()

  for (const id of [site.id, otherSite.id]) {
    await page.request.delete(`/api/admin/sites/${id}`)
    await page.request.delete(`/api/admin/sites/${id}?permanent=true`)
  }
})
