/**
 * Compatibility layer: the tradition registry lives in src/traditions.
 * Kept for older imports; new code should import from '@/traditions'.
 */
import { TRADITIONS, getTradition as resolveTradition, sortCeremonies, isAnchorCeremony, ceremonyRank, SHARED_PRESETS } from '../src/traditions/index.js'

export { TRADITIONS }
export const CUSTOM_EVENT_PRESETS = SHARED_PRESETS

export function getTradition(id = 'muslim', variant) {
  return resolveTradition(id, variant)
}

export function getCeremonyCanonicalRank(ceremony) {
  return ceremonyRank(ceremony)
}

export function sortCeremoniesChronologically(ceremonyList) {
  return sortCeremonies(ceremonyList)
}

export function isWeddingAnchorCeremony(ceremony) {
  return isAnchorCeremony(ceremony)
}

export function getProgramTogglePresets(traditionId = 'muslim') {
  return resolveTradition(traditionId).togglePresets || []
}
