import { fullyReduce, makeForecastResult, turningPoint } from './_forecastHelpers'
import { reduceToSingleDigit } from '../utils'
import type { Pinnacle, NumberResult } from '../types'

/**
 * Pinnacle numbers:
 *   Components (month, day, year) are each fully-reduced first.
 *   The SUMS of those components are reduced with master-number awareness
 *   (so 11, 22, 33 CAN appear in a Pinnacle result).
 *
 *   First  = reduce(month + day)
 *   Second = reduce(day   + year)
 *   Third  = reduce(First + Second)
 *   Fourth = reduce(month + year)
 *
 * Age spans:
 *   First:  0            → tp
 *   Second: tp           → tp+9
 *   Third:  tp+9         → tp+18
 *   Fourth: tp+18        → 99
 */
export function calculatePinnacles(
  birthDate: string,
  lifePath: NumberResult,
  currentAge: number,
): Pinnacle[] {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const month = fullyReduce(parseInt(monthStr, 10))
  const day   = fullyReduce(parseInt(dayStr,   10))
  const year  = fullyReduce(parseInt(yearStr,  10))
  const tp    = turningPoint(lifePath.value)

  const p1 = reduceToSingleDigit(month + day)
  const p2 = reduceToSingleDigit(day   + year)
  const p3 = reduceToSingleDigit(p1    + p2)
  const p4 = reduceToSingleDigit(month + year)

  const defs: { value: number; start: number; end: number; label: string }[] = [
    { value: p1, start: 0,      end: tp,      label: 'First'  },
    { value: p2, start: tp,     end: tp + 9,  label: 'Second' },
    { value: p3, start: tp + 9, end: tp + 18, label: 'Third'  },
    { value: p4, start: tp + 18, end: 99,     label: 'Fourth' },
  ]

  return defs.map(({ value, start, end, label }) => ({
    number:    makeForecastResult(value),
    startAge:  start,
    endAge:    end,
    isCurrent: currentAge >= start && currentAge < end,
    label,
  }))
}
