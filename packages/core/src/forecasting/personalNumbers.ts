import { sumDigits, reduceToSingleDigit } from '../utils'
import { makeForecastResult } from './_forecastHelpers'
import { reductionChain } from '../numerology/_helpers'
import type { ForecastResult } from '../types'

/**
 * Personal Year = rawDay + rawMonth + digitSum(year) → reduce with master awareness.
 *
 * CORRECT formula (per numerologist):
 *   - Use raw (unreduced) day and month numbers
 *   - Use ONE pass of digit sum for the year (e.g. 2026 → 2+0+2+6 = 10, not 1)
 *   - Sum all three, then reduce (preserving master numbers 11, 22, 33)
 */
export function calculatePersonalYear(
  birthDate: string,
  targetYear: number,
): ForecastResult {
  const [, monthStr, dayStr] = birthDate.split('-')
  const month        = parseInt(monthStr, 10)
  const day          = parseInt(dayStr,   10)
  const yearDigitSum = sumDigits(targetYear)
  const total        = month + day + yearDigitSum
  const value        = reduceToSingleDigit(total)

  const yearPart  = `${String(targetYear).split('').join('+')}=${yearDigitSum}`
  const totalPart = total === value ? String(value) : `${total}→${reductionChain(total)}`
  const workings  = `Ngày(${day}) + Tháng(${month}) + ${yearPart} = ${totalPart}`

  const result = makeForecastResult(value)
  return { ...result, workings }
}

/**
 * Personal Month = personalYear.value + targetMonth → reduce.
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
