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
  const lpBase   = baseValue(lifePath)
  const destBase = baseValue(destiny)
  const diff     = Math.abs(lpBase - destBase)

  const lpLabel   = lifePath.isMasterNumber  ? `${lifePath.value}→${lpBase}`  : String(lpBase)
  const destLabel = destiny.isMasterNumber   ? `${destiny.value}→${destBase}` : String(destBase)
  const workings  = `|Đường Đời(${lpLabel}) − Sứ Mệnh(${destLabel})| = ${diff}`

  return makeResult(diff, diff, workings)
}
