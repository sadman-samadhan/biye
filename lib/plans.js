/**
 * What each plan includes. Storage sizes are after resizing (about 0.8 MB per
 * photo across its three variants). `sites.storage_quota_bytes` overrides the
 * plan's storage for one site.
 */
const MB = 1024 * 1024

export const PLANS = {
  invitation: { label: 'Invitation', photos: 40, storageBytes: 80 * MB, videos: 1, videoBytes: 40 * MB },
  standard: { label: 'Standard', photos: 300, storageBytes: 400 * MB, videos: 2, videoBytes: 60 * MB },
  premium: { label: 'Premium', photos: 800, storageBytes: 1024 * MB, videos: 4, videoBytes: 100 * MB },
}

export function planLimits(site) {
  const plan = PLANS[site?.plan] || PLANS.standard
  return {
    ...plan,
    storageBytes: site?.storage_quota_bytes || plan.storageBytes,
  }
}

export function formatBytes(bytes) {
  if (!bytes) return '0 MB'
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0)} MB`
  return `${(bytes / (1024 * MB)).toFixed(1)} GB`
}
