import { isMasterNumber, sumDigits, reduceToSingleDigit } from '../utils'
import { makeResult, reductionChain } from './_helpers'
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
  const lpBase   = toBase(lifePath.value)
  const destBase = toBase(destiny.value)
  const compound = lpBase + destBase
  const value    = reduceToSingleDigit(compound)

  const lpLabel   = lifePath.isMasterNumber   ? `${lifePath.value}→${lpBase}`   : String(lpBase)
  const destLabel = destiny.isMasterNumber    ? `${destiny.value}→${destBase}`  : String(destBase)
  const totalPart = compound === value
    ? `${lpBase}+${destBase}=${value}`
    : `${lpBase}+${destBase}=${compound}→${reductionChain(compound)}`
  const workings = `Đường Đời(${lpLabel}) + Sứ Mệnh(${destLabel}) = ${totalPart}`

  return makeResult(compound, value, workings)
}
