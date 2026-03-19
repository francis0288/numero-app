import { sumDigits, isMasterNumber, reduceToSingleDigit } from '../utils'
import type { ForecastResult } from '../types'

/**
 * Fully reduce n to a single digit 1-9 — never stops at master numbers.
 * Used for date components (month, day, year) in personal numbers,
 * life cycles, and challenges.
 */
export function fullyReduce(n: number): number {
  let v = Math.abs(n)
  while (v > 9) v = sumDigits(v)
  return v
}

/** Build a ForecastResult. Master numbers show as "11/2", "22/4", "33/6". */
export function makeForecastResult(value: number): ForecastResult {
  const master = isMasterNumber(value)
  const display = master ? `${value}/${sumDigits(value)}` : String(value)
  return { value, display, isMasterNumber: master }
}

/**
 * Reduce the COMPONENTS of birth date (month, day, year separately) to a
 * single digit each (fully, no master-number preservation).
 */
export function reduceDateComponents(birthDate: string): {
  month: number
  day: number
  year: number
} {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  return {
    month: fullyReduce(parseInt(monthStr, 10)),
    day:   fullyReduce(parseInt(dayStr,   10)),
    year:  fullyReduce(parseInt(yearStr,  10)),
  }
}

/**
 * Age span turning point = 36 minus the life-path base value.
 * Master life paths use their base digit: 11→2, 22→4, 33→6.
 */
export function turningPoint(lifePathValue: number): number {
  const base = isMasterNumber(lifePathValue)
    ? sumDigits(lifePathValue)
    : lifePathValue
  return 36 - base
}

/** Compute age from a birth date and reference date. */
export function computeAge(birthDate: string, ref: Date): number {
  const birth = new Date(birthDate)
  let age = ref.getFullYear() - birth.getFullYear()
  const m = ref.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--
  return Math.max(0, age)
}
