import { fullyReduce, makeForecastResult, turningPoint } from './_forecastHelpers'
import type { LifeCycle, NumberResult } from '../types'

/**
 * Life Cycle numbers are the fully-reduced birth date components.
 * They never produce master numbers (full reduction, e.g. day=11→2).
 *
 * First Cycle  = fullyReduce(birth month)      → runs birth → turningPoint
 * Second Cycle = fullyReduce(birth day)        → runs turningPoint → turningPoint+27
 * Third Cycle  = fullyReduce(birth year total) → runs turningPoint+27 → end of life
 *
 * turningPoint = 36 − lifePathBaseValue
 */
export function calculateLifeCycles(
  birthDate: string,
  lifePath: NumberResult,
  currentAge: number,
): LifeCycle[] {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const tp = turningPoint(lifePath.value)

  const spans = [
    { start: 0,       end: tp,       value: fullyReduce(parseInt(monthStr, 10)), label: 'First'  },
    { start: tp,      end: tp + 27,  value: fullyReduce(parseInt(dayStr,   10)), label: 'Second' },
    { start: tp + 27, end: 99,       value: fullyReduce(parseInt(yearStr,  10)), label: 'Third'  },
  ]

  return spans.map(({ start, end, value }) => ({
    number:    makeForecastResult(value),
    startAge:  start,
    endAge:    end,
    isCurrent: currentAge >= start && currentAge < end,
  }))
}
