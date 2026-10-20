import 'server-only'
import { cache } from 'react'
import { isDemoSiteId } from '../demo'
import { getCurrentUser, getSiteRole } from './auth'
import { effectiveStatus, getSiteBySlug } from './site-data'

/**
 * Who is looking at a site and what they may do.
 * Guest (passcode) sessions are added to this in the guest-access phase.
 */
export const getViewer = cache(async (site) => {
  const user = await getCurrentUser()
  const role = user && site && !isDemoSiteId(site.id) ? await getSiteRole(site.id) : user?.isAdmin ? 'admin' : null
  return {
    user,
    role,
    isAdmin: role === 'admin',
    isMember: role === 'owner' || role === 'editor',
    canPreview: Boolean(role),
  }
})

/**
 * The site for a public request, or null when this viewer may not see it.
 * Live sites are public; drafts, trash and expired sites are visible to the
 * couple and operators only (with a banner).
 */
export const getSiteForRequest = cache(async (slug) => {
  const site = await getSiteBySlug(slug)
  if (!site) return null

  const status = effectiveStatus(site)
  const viewer = await getViewer(site)
  if (status === 'live' || viewer.canPreview) {
    return { site, status, viewer }
  }
  return null
})
