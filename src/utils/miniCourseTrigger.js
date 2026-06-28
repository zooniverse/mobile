/**
 * Pure helper for the mini-course trigger cadence. Mirrors PFE's
 * `maybeLaunchMiniCourse` logic from `Panoptes-Front-End/app/classifier/index.cjsx`.
 *
 * The cadence comes from the mini-course resource at
 * `configuration.minicourse_frequency` (an array of integers):
 *
 *   - length > 1   → exact-match: show only when count is in the list.
 *   - length === 1 → modulo: show every `frequency[0]` classifications.
 *   - empty/missing → modulo by `DEFAULT_FREQUENCY` (5).
 *
 * Always returns false at count <= 0 to avoid firing on the initial state.
 */

export const DEFAULT_FREQUENCY = 5

export const shouldShowMiniCourse = (count, frequency) => {
  if (!Number.isFinite(count) || count <= 0) return false

  if (Array.isArray(frequency) && frequency.length > 1) {
    return frequency.includes(count)
  }

  const interval =
    Array.isArray(frequency) && frequency.length === 1
      ? frequency[0]
      : DEFAULT_FREQUENCY

  if (!Number.isFinite(interval) || interval <= 0) return false
  return count % interval === 0
}
