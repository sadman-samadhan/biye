import 'server-only'
import { cache } from 'react'
import { SLUG_PATTERN } from '../slugs'
import { accessScopeForPhase, computePhase } from '../phase'
import { getCurrentUser, getSiteRole } from './auth'
import { effectiveStatus, getSiteAccess, getSiteBySlug, getSiteContent } from './site-data'
import { readGuestSession } from './guest-access'

/** Operator / couple viewing their own site. */
export const getViewer = cache(async (site) => {
  const user = await getCurrentUser()
  const role = user && site ? await getSiteRole(site.id) : user?.isAdmin ? 'admin' : null
  return {
    user,
    role,
    isAdmin: role === 'admin',
    isMember: role === 'owner' || role === 'editor',
    canPreview: Boolean(role),
  }
})

/**
 * Everything a public route needs to decide what to show for /{slug}:
 *   site, status, viewer (couple/operator), access settings, guest session,
 *   current phase and `canView(scope)` for the 'invite' and 'site' scopes.
 * Returns null when the site doesn't exist or this viewer may not know it exists.
 */
export const getSiteForRequest = cache(async (slug) => {
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) return null
  const site = await getSiteBySlug(slug)
  if (!site) return null

  const status = effectiveStatus(site)
  const viewer = await getViewer(site)
  if (status !== 'live' && !viewer.canPreview) return null

  const access = await getSiteAccess(site.id)
  const guest = access ? await readGuestSession(site.id, access.passcode_version) : null
  const { ceremonies } = await getSiteContent(site.id)

  const phase = computePhase({
    products: site.products || ['site'],
    phaseOverride: site.phase_override,
    memoriesPublished: site.memories_published,
    ceremonies,
  })

  // A scope is open when it is set to public, or no passcode has been set yet.
  const scopeIsPublic = (scope) => {
    if (!access) return true
    const mode = scope === 'invite' ? access.invite_access : access.site_access
    return mode === 'public' || !access.passcode_enc
  }
  const canView = (scope) => viewer.canPreview || Boolean(guest) || scopeIsPublic(scope)

  return {
    site,
    status,
    viewer,
    access,
    guest,
    phase,
    scope: accessScopeForPhase(phase),
    canView,
    // Private photos need the memories scope; public invitations only show photos marked public.
    publicOnlyMedia: !canView('site'),
  }
})
