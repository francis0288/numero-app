import { sumDigits, reduceToSingleDigit } from '../utils'
import { makeForecastResult } from './_forecastHelpers'
import type { ForecastResult } from '../types'

/**
 * Personal Year = rawDay + rawMonth + digitSum(year) → reduce with master awareness.
 *
 * CORRECT formula (per numerologist):
 *   - Use raw (unreduced) day and month numbers
 *   - Use ONE pass of digit sum for the year (e.g. 2026 → 2+0+2+6 = 10, not 1)
 *   - Sum all three, then reduce (preserving master numbers 11, 22, 33)
 *
 * Example: born April 13, year 2026
 *   13 + 4 + (2+0+2+6=10) = 27 → 9
 *
 * Example: born March 9, year 2026
 *   9 + 3 + 10 = 22 → 22/4 (Master Number!)
 */
export function calculatePersonalYear(
  birthDate: string,
  targetYear: number,
): ForecastResult {
  const [, monthStr, dayStr] = birthDate.split('-')
  const month = parseInt(monthStr, 10)
  const day   = parseInt(dayStr,   10)
  const yearDigitSum = sumDigits(targetYear)
  const value = reduceToSingleDigit(month + day + yearDigitSum)
  return makeForecastResult(value)
}

/**
 * Personal Month = personalYear.value + targetMonth → reduce.
 * Month is NOT pre-reduced — we add it as-is (e.g., 9+12=21→3).
 */
export function calculatePersonalMonth(
  personalYear: ForecastResult,
  targetMonth: number,
): ForecastResult {
  const value = reduceToSingleDigit(personalYear.value + targetMonth)
  return makeForecastResult(value)
}

/**
 * Personal Day = personalMonth.value + targetDay → reduce.
 */
export function calculatePersonalDay(
  personalMonth: ForecastResult,
  targetDay: number,
): ForecastResult {
  const value = reduceToSingleDigit(personalMonth.value + targetDay)
  return makeForecastResult(value)
}

/** Convenience wrapper that uses today's actual date. */
export function calculateToday(birthDate: string): {
  personalYear: ForecastResult
  personalMonth: ForecastResult
  personalDay: ForecastResult
} {
  const today = new Date()
  const personalYear  = calculatePersonalYear(birthDate, today.getFullYear())
  const personalMonth = calculatePersonalMonth(personalYear, today.getMonth() + 1)
  const personalDay   = calculatePersonalDay(personalMonth, today.getDate())
  return { personalYear, personalMonth, personalDay }
}
