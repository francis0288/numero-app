import { isMasterNumber, sumDigits, reduceToSingleDigit } from '../utils'
import { makeResult } from './_helpers'
import type { NumberResult } from '../types'

/**
 * Maturity = lifePath + destiny (master numbers are reduced to their base digit
 * before adding, e.g. 11→2, 22→4, so 11+11 = 2+2 = 4, not 22).
 */
function toBase(n: number): number {
  return isMasterNumber(n) ? sumDigits(n) : n
}

export function calculateMaturity(
  lifePath: NumberResult,
  destiny: NumberResult,
): NumberResult {
  const compound = toBase(lifePath.value) + toBase(destiny.value)
  const value = reduceToSingleDigit(compound)
  return makeResult(compound, value)
}
