import sharp from 'sharp'

export const OPERATOR = {
  email: process.env.E2E_OPERATOR_EMAIL || 'operator@shubhobiye.test',
  password: process.env.E2E_OPERATOR_PASSWORD || 'local-operator-pass-123',
}

/** Signs a browser context in through the real /auth/login route. */
export async function signIn(page, { email, password }) {
  const origin = new URL(page.context()._options?.baseURL || process.env.E2E_BASE_URL || 'http://localhost:3210').origin
  const res = await page.request.post('/auth/login', { data: { email, password }, headers: { origin } })
  if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)
}

/** A small real JPEG with a gradient, for upload tests. */
export async function testPhoto(name = 'photo.jpg', hue = 30) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="hsl(${hue},70%,60%)"/><stop offset="1" stop-color="hsl(${hue + 40},60%,30%)"/></linearGradient></defs><rect width="1600" height="1200" fill="url(#g)"/></svg>`
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer()
  return { name, mimeType: 'image/jpeg', buffer }
}

export const uniqueSlug = (prefix) => `${prefix}-${Date.now().toString(36)}`

/** The visible editor panel with this exact title. */
export const panel = (page, title) => page.locator('section').filter({ has: page.getByRole('heading', { name: title, exact: true, level: 2 }) })
