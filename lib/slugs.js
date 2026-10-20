/**
 * Site slugs become root-level URLs (shubhobiye.com/{slug}), so they must not
 * collide with app routes or folders in /public.
 */

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/

export const RESERVED_SLUGS = new Set([
  // app routes
  'admin', 'dashboard', 'api', 'auth', 'login', 'logout', 'signup', 'register', 'account',
  's', 'i', 'u', 'g', 'invite', 'memories', 'media', 'cdn', 'app', 'www', 'mail',
  'demo', 'demos', 'themes', 'theme', 'pricing', 'about', 'contact', 'terms', 'privacy',
  'help', 'support', 'blog', 'faq', 'bn', 'en', 'new', 'edit', 'preview', 'settings',
  // framework / files
  '_next', 'static', 'public', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'manifest',
  'icon', 'apple-icon', 'opengraph-image', 'og',
  // folders in /public
  'images', 'videos', 'audio', 'brand', 'monogram-frames', 'fonts',
  // legacy
  'design-philosophy',
])

/** Best-effort conversion of free text ("Rahim & Karima") into a slug ("rahim-and-karima"). */
export function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '')
}

/** Returns an error message, or null when the slug is usable. */
export function slugProblem(slug) {
  if (!slug) return 'Slug is required'
  if (!SLUG_PATTERN.test(slug)) {
    return 'Use 3–48 lowercase letters, numbers and dashes (no dash at the start or end)'
  }
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" is reserved`
  return null
}
