import { test, expect } from '@playwright/test'
import { OPERATOR, signIn, testPhoto } from './helpers.mjs'

test('operator creates a site, edits every core section and publishes it', async ({ page, browser }) => {
  await signIn(page, OPERATOR)

  // 1. Intake: names → address is derived automatically
  await page.goto('/admin/sites/new')
  const stamp = Date.now().toString(36)
  await page.getByRole('textbox', { name: 'Couple names (English)' }).fill(`Nadia & Tanvir ${stamp}`)
  await page.getByRole('textbox', { name: 'Couple names (বাংলা)' }).fill('নাদিয়া ও তানভীর')
  const slug = await page.getByLabel('Address').inputValue()
  expect(slug).toBe(`nadia-and-tanvir-${stamp}`)
  await page.getByRole('button', { name: 'Create draft site' }).click()
  await page.waitForURL(/\/admin\/sites\/[0-9a-f-]{36}/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nadia & Tanvir')

  // 2. Couple & date
  await page.getByRole('textbox', { name: 'Wedding date (as displayed) (English)' }).fill('12 December 2026')
  await page.getByRole('button', { name: 'Save changes' }).first().click()
  await expect(page.getByText('Couple & date saved')).toBeVisible()

  // 3. Opening: upload a cover photo
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Opening' }).click()
  const opening = page.locator('div:not([hidden]) > section').filter({ hasText: 'Opening' })
  await opening.locator('input[type=file]').first().setInputFiles(await testPhoto('cover.jpg', 20))
  await expect(opening.getByText('Replace')).toBeVisible()
  await opening.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Opening saved')).toBeVisible()

  // 4. Ceremonies: add a preset, set venue + map link
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Ceremonies' }).click()
  const ceremonies = page.locator('div:not([hidden]) > section').filter({ hasText: 'Ceremonies' })
  await ceremonies.getByRole('button', { name: /Sangeet Night/ }).click()
  await ceremonies.getByRole('textbox', { name: 'Venue (English)' }).fill('Dhanmondi Lake Pavilion')
  await ceremonies.getByLabel('Google Maps link').fill('https://maps.app.goo.gl/example')
  await ceremonies.getByLabel('Starts (Dhaka time)').fill('2026-12-10T18:30')
  await ceremonies.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Ceremonies saved')).toBeVisible()

  // 5. Gallery: two photos into the wedding album
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Gallery' }).click()
  const gallery = page.locator('div:not([hidden]) > section').filter({ hasText: 'Gallery' })
  await gallery.locator('input[type=file]').setInputFiles([await testPhoto('a.jpg', 200), await testPhoto('b.jpg', 320)])
  await expect(gallery.getByRole('listitem')).toHaveCount(2)
  await gallery.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Gallery saved')).toBeVisible()

  // 6. Look: second palette, hide the guestbook
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Look & sections' }).click()
  const look = page.locator('div:not([hidden]) > section').filter({ hasText: 'Look & sections' })
  await look.getByRole('radio').nth(1).click()
  await look.getByRole('switch', { name: 'Guestbook' }).click()
  await look.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Look & sections saved')).toBeVisible()

  // 7. Couple access: invite link
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Couple access' }).click()
  const access = page.locator('div:not([hidden]) > section').filter({ hasText: 'Couple access' })
  await access.getByLabel('Email').fill(`nadia-${stamp}@example.com`)
  await access.getByRole('button', { name: 'Create invite link' }).click()
  await expect(access.getByText(/\/auth\/confirm\?token_hash=/)).toBeVisible()

  // 8. Publish
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Site settings' }).click()
  const settings = page.locator('div:not([hidden]) > section').filter({ hasText: 'Site settings' })
  await settings.getByLabel('Status').selectOption('live')
  await settings.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Site settings saved')).toBeVisible()

  // 9. Privacy & sharing: the site has a passcode from creation
  await page.getByRole('navigation', { name: 'Editor sections' }).getByRole('button', { name: 'Privacy & sharing' }).click()
  const privacy = page.locator('div:not([hidden]) > div').filter({ hasText: 'Guest passcode' }).first()
  const passcode = (await privacy.locator('p.font-mono').first().textContent()).trim()
  expect(passcode).toMatch(/^[a-z]+-\d{4}$/)
  await expect(privacy.getByAltText(/QR code/)).toBeVisible()

  // 10. Before the wedding the invitation is public by default, but private photos stay hidden
  const guest = await browser.newContext()
  const guestPage = await guest.newPage()
  expect((await guestPage.goto(`/${slug}`)).status()).toBe(200)
  await expect(guestPage.locator('body')).toContainText('Dhanmondi Lake Pavilion')
  await expect(guestPage.locator('img[src*="/object/sign/"]')).toHaveCount(0)

  // 11. Make the invitation passcode-only: the guest must now enter it
  await privacy.page().getByLabel('Invitation (before the wedding)').selectOption('passcode')
  await expect(page.getByText('Saved').first()).toBeVisible()
  await guestPage.reload()
  await expect(guestPage.getByText('Enter the passcode from your invitation')).toBeVisible()
  await expect(guestPage.locator('body')).not.toContainText('Dhanmondi Lake Pavilion')
  await guestPage.getByPlaceholder('Passcode · পাসকোড').fill('wrong-0000')
  await guestPage.getByRole('button', { name: /Enter/ }).click()
  await expect(guestPage.getByText('That passcode didn’t work')).toBeVisible()
  await guestPage.getByPlaceholder('Passcode · পাসকোড').fill(passcode.toUpperCase())
  await guestPage.getByPlaceholder(/Your name/).fill('Rafiq Uncle')
  await guestPage.getByRole('button', { name: /Enter/ }).click()
  await expect(guestPage.locator('body')).toContainText('Dhanmondi Lake Pavilion')
  await expect(guestPage.locator('img[src*="/object/sign/"]').first()).toBeVisible()
  await guest.close()

  // 12. Trash and restore from the sites list
  await page.goto('/admin/sites')
  const row = page.getByRole('listitem').filter({ hasText: `/${slug}` })
  await row.getByRole('button', { name: `Move ${slug} to Trash` }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Move to Trash' }).click()
  await expect(page.getByText('Moved to Trash')).toBeVisible()
  await page.getByRole('tab', { name: /Trash/ }).click()
  await page.getByRole('listitem').filter({ hasText: `/${slug}` }).getByRole('button', { name: 'Restore' }).click()
  await expect(page.getByText(`${slug} is a draft`)).toBeVisible()
})
