import { test, expect } from '@playwright/test'

test('marketing pages, theme filters and a demo invitation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One link for your whole wedding')
  const themes = page.locator('#themes')
  await expect(themes.getByRole('listitem')).toHaveCount(6)

  // Filtering by tradition keeps the theme designed for it
  await themes.getByRole('button', { name: 'Hindu Wedding' }).click()
  await expect(themes.getByRole('heading', { name: 'Laal Paar' })).toBeVisible()
  await expect(themes.getByRole('heading', { name: 'Noor' })).toHaveCount(0)

  // Bangla home
  await page.goto('/bn')
  await expect(page.locator('[lang="bn"]').first()).toContainText('পুরো বিয়ের জন্য একটি লিংক')

  // Theme page → demo invitation with the chosen tradition
  await page.goto('/themes/noor')
  await page.getByRole('listitem').filter({ hasText: 'Muslim Wedding' }).getByRole('link', { name: 'Invitation' }).click()
  await page.waitForURL('**/demo/noor/muslim/invite')
  await page.getByRole('button', { name: /skip/i }).click().catch(() => {})
  await expect(page.locator('#events')).toBeVisible()

  // The demo RSVP walks through the flow without sending anything
  const rsvp = page.locator('#rsvp')
  await rsvp.getByLabel(/Your name/).fill('Demo Guest')
  await rsvp.getByRole('button', { name: /Joyfully accept/ }).click()
  await rsvp.getByRole('button', { name: 'Send reply' }).click()
  await expect(rsvp.getByText('Thank you! Your reply has reached the couple.')).toBeVisible()

  // Old demo addresses lead to the new demos
  await page.goto('/demo-hindu')
  await expect(page).toHaveURL(/\/demo\/laal-paar\/hindu$/)
})
