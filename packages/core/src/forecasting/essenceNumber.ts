import { getLetterValue, reduceToSingleDigit } from '../utils'
import { makeForecastResult } from './_forecastHelpers'
import type { ForecastResult } from '../types'

/**
 * Essence Number — changes each year based on transiting letters of the name.
 *
 * Each letter's "transit duration" equals its Pythagorean value:
 *   A=1 year, B=2 years, J=1 year, R=9 years, etc.
 *
 * Algorithm (per name part):
 *   1. Collect the letters of the part.
 *   2. Compute the total cycle length = sum of all letter values.
 *   3. Find the position within that cycle: pos = currentAge % totalCycle.
 *   4. Walk through letters accumulating durations until we reach pos —
 *      that letter is "active" for this part at currentAge.
 *
 * The active letter values from all parts are summed, then reduced
 * (master-number-aware).
 */
export function calculateEssence(
  birthCertName: string,
  currentAge: number,
): ForecastResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  let essenceSum = 0

  for (const part of parts) {
    // Keep only letters (skip hyphens, apostrophes, etc.)
    const letters = [...part].filter((c) => /[A-Z]/.test(c))
    if (letters.length === 0) continue

    // Total cycle length for this name part
    const totalCycle = letters.reduce((sum, c) => sum + getLetterValue(c), 0)
    if (totalCycle === 0) continue

    // Position within the repeating letter cycle
    const pos = currentAge % totalCycle

    // Walk through letters to find which one is active at this position
    let cumulative = 0
    let activeValue = getLetterValue(letters[0])
    for (const letter of letters) {
      const duration = getLetterValue(letter)
      if (pos < cumulative + duration) {
        activeValue = duration
        break
      }
      cumulative += duration
    }

    essenceSum += activeValue
  }

  const value = reduceToSingleDigit(essenceSum)
  return makeForecastResult(value)
}
