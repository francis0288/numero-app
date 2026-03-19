import { isMasterNumber, isKarmicDebt, sumDigits, reduceToSingleDigit, getLetterValue } from '../utils'
import type { NumberResult } from '../types'

/**
 * Builds the canonical display string:
 *  - Master final  → "11/2", "22/4", "29/11/2"
 *  - Karmic compound → "13/4"
 *  - Otherwise      → "7"
 */
export function buildDisplay(compound: number, value: number): string {
  if (isMasterNumber(value)) {
    const base = sumDigits(value) // 11→2, 22→4, 33→6
    return compound === value
      ? `${value}/${base}`
      : `${compound}/${value}/${base}`
  }
  if (isKarmicDebt(compound) && compound !== value) {
    return `${compound}/${value}`
  }
  return String(value)
}

export function makeResult(compound: number, value: number): NumberResult {
  return {
    compound,
    value,
    display: buildDisplay(compound, value),
    isMasterNumber: isMasterNumber(value),
    isKarmicDebt: isKarmicDebt(compound),
    karmicDebtNumber: isKarmicDebt(compound) ? compound : undefined,
  }
}

/**
 * Core name-reduction engine used by destiny / soul / personality / currentName.
 * @param parts   Name split by spaces (already uppercased)
 * @param filter  Selects which characters to include (all letters / vowels / consonants)
 */
export function reduceNameParts(
  parts: string[],
  filter: (char: string) => boolean,
): NumberResult {
  const partTotals = parts.map((part) => {
    const partSum = [...part]
      .filter(filter)
      .reduce((sum, c) => sum + getLetterValue(c), 0)
    return reduceToSingleDigit(partSum)
  })
  const compound = partTotals.reduce((a, b) => a + b, 0)
  const value = reduceToSingleDigit(compound)
  return makeResult(compound, value)
}
