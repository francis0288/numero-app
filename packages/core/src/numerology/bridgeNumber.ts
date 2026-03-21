import { isMasterNumber, sumDigits } from '../utils'
import { makeResult } from './_helpers'
import type { NumberResult } from '../types'

/**
 * Bridge Number (CS Kết Nối):
 * |lifePath base value - destiny base value|
 * For master numbers, uses the base digit (11→2, 22→4, 33→6).
 * Shows what bridges the gap between Life Path and Destiny.
 */
function baseValue(r: NumberResult): number {
  return r.isMasterNumber ? sumDigits(r.value) : r.value
}

export function calculateBridge(
  lifePath: NumberResult,
  destiny: NumberResult,
): NumberResult {
  const diff = Math.abs(baseValue(lifePath) - baseValue(destiny))
  return makeResult(diff, diff)
}
