import { reduceToSingleDigit } from '../utils'
import { fullyReduce, makeForecastResult } from './_forecastHelpers'
import type { ForecastResult } from '../types'

/**
 * Personal Year = fully-reduce(month) + fully-reduce(day) + fully-reduce(year digits).
 * The three COMPONENTS are always reduced to a single digit (no master stops).
 * The FINAL SUM is reduced with master-number awareness (can be 11 / 22 / 33).
 *
 * Example: birthDate="1969-12-11", targetYear=2026
 *   month=12→3, day=11→2, year=2+0+2+6=10→1 → total=6
 */
export function calculatePersonalYear(
  birthDate: string,
  targetYear: number,
): ForecastResult {
  const [, monthStr, dayStr] = birthDate.split('-')
  const month = fullyReduce(parseInt(monthStr, 10))
  const day   = fullyReduce(parseInt(dayStr,   10))
  const year  = fullyReduce(targetYear)
  const value = reduceToSingleDigit(month + day + year)
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
