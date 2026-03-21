import { reduceToSingleDigit } from '../utils'
import { makeForecastResult } from './_forecastHelpers'
import { reductionChain } from '../numerology/_helpers'
import type { ForecastResult } from '../types'

/**
 * Personal Year — sum ALL individual digits of day + month + full 4-digit year.
 *
 * Example: born April 13, year 2026
 *   day=13 → 1+3, month=04 → 0+4, year=2026 → 2+0+2+6
 *   total = 1+3+0+4+2+0+2+6 = 18 → 9
 *
 * This correctly catches master numbers like 22 that arise mid-sum.
 */
export function calculatePersonalYear(
  birthDate: string,
  targetYear: number,
): ForecastResult {
  const [, monthStr, dayStr] = birthDate.split('-')

  // Sum every individual digit from day, month, and 4-digit year
  const allDigits = (dayStr + monthStr + String(targetYear)).split('').map(Number)
  const total     = allDigits.reduce((a, b) => a + b, 0)
  const value     = reduceToSingleDigit(total)

  const dayPart   = dayStr.split('').join('+')
  const monthPart = monthStr.split('').join('+')
  const yearPart  = String(targetYear).split('').join('+')
  const totalPart = total === value ? String(value) : `${total}→${reductionChain(total)}`
  const workings  = `(${dayPart}) + (${monthPart}) + (${yearPart}) = ${totalPart}`

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
 * Calendar Day Number lookup: maps calendar day (1–31) to a single digit (1–9).
 * Pattern repeats 1–9, with 28–31 continuing the cycle.
 */
const CALENDAR_DAY_NUMBER: Record<number, number> = {
   1:1,  2:2,  3:3,  4:4,  5:5,  6:6,  7:7,  8:8,  9:9,
  10:1, 11:2, 12:3, 13:4, 14:5, 15:6, 16:7, 17:8, 18:9,
  19:1, 20:2, 21:3, 22:4, 23:5, 24:6, 25:7, 26:8, 27:9,
  28:1, 29:2, 30:3, 31:4,
}

/**
 * Personal Day = calendarDayNumber(targetDay) + personalMonth.value → reduce.
 */
export function calculatePersonalDay(
  personalMonth: ForecastResult,
  targetDay: number,
): ForecastResult {
  const calDay = CALENDAR_DAY_NUMBER[targetDay] ?? (((targetDay - 1) % 9) + 1)
  const value  = reduceToSingleDigit(personalMonth.value + calDay)
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
