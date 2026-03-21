import { getLetterValue, reduceToSingleDigit } from '../utils'
import { makeForecastResult } from './_forecastHelpers'
import type { ForecastResult } from '../types'

/**
 * Essence Number — changes each year based on transiting letters of the name.
 *
 * Each letter's "transit duration" equals its Pythagorean value:
 *   A=1 year, B=2 years, J=1 year, R=9 years, etc.
 *
 * When nameParts is provided the three semantic groups are used as transits:
 *   Spiritual Transit = lastName  (Họ)
 *   Mental Transit    = middleName (Tên đệm) — omitted if empty
 *   Physical Transit  = firstName (Tên)
 *
 * Each group's letters are summed together as a single unit before cycling,
 * so "THANH TINH" (a two-word given name) is treated as one Physical Transit.
 *
 * Algorithm (per group):
 *   1. Collect all letters from the group (ignoring spaces and non-alpha chars).
 *   2. Compute the total cycle length = sum of all letter values.
 *   3. Find the position within that cycle: pos = currentAge % totalCycle.
 *   4. Walk through letters accumulating durations until we reach pos —
 *      that letter's value is "active" for this group at currentAge.
 *
 * The active letter values from all groups are summed, then reduced
 * (master-number-aware).
 */
export function calculateEssence(
  birthCertName: string,
  currentAge: number,
  nameParts?: { lastName: string; middleName?: string; firstName: string },
): ForecastResult {
  // Use semantic name groups when provided; otherwise fall back to word-by-word.
  const groups: string[] = nameParts
    ? [
        nameParts.lastName,
        ...(nameParts.middleName ? [nameParts.middleName] : []),
        nameParts.firstName,
      ]
    : birthCertName.toUpperCase().split(' ').filter(Boolean)

  let essenceSum = 0

  for (const group of groups) {
    // Collect letters from the entire group (handles multi-word parts like "THANH TINH")
    const letters = [...group.toUpperCase()].filter((c) => /[A-Z]/.test(c))
    if (letters.length === 0) continue

    const totalCycle = letters.reduce((sum, c) => sum + getLetterValue(c), 0)
    if (totalCycle === 0) continue

    const pos = currentAge % totalCycle

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
