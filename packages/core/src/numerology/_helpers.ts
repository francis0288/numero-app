import { isMasterNumber, isKarmicDebt, sumDigits, reduceToSingleDigit, getLetterValue } from '../utils'
import type { NumberResult } from '../types'

export function buildDisplay(compound: number, value: number): string {
  if (isMasterNumber(value)) {
    const base = sumDigits(value)
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
 * Method B (Cộng Rút Gọn — Reducing Down):
 * Reduce each name part to a single digit first, then sum and reduce.
 * This is the existing behavior.
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

/**
 * Method A (Cộng Gộp Ngang — Adding Across):
 * Add ALL matching letter values together in one sum, then reduce.
 * No per-part reduction.
 */
export function reduceNameMethodA(
  parts: string[],
  filter: (char: string) => boolean,
): NumberResult {
  const total = parts.reduce((sum, part) => {
    return sum + [...part].filter(filter).reduce((s, c) => s + getLetterValue(c), 0)
  }, 0)
  const value = reduceToSingleDigit(total)
  return makeResult(total, value)
}
