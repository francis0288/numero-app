import { fullyReduce, turningPoint } from './_forecastHelpers'
import type { Challenge, NumberResult } from '../types'

/**
 * Challenge numbers use SUBTRACTION (absolute difference) of fully-reduced date parts.
 * They are never Master Numbers.
 *
 *   First    = |day  − month|
 *   Second   = |year − day|
 *   Third    = |First − Second|   (the Major Challenge)
 *   Fourth   = |month − year|
 *
 * Age spans: same structure as Pinnacles.
 */
export function calculateChallenges(
  birthDate: string,
  lifePath: NumberResult,
  currentAge: number,
): Challenge[] {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const month = fullyReduce(parseInt(monthStr, 10))
  const day   = fullyReduce(parseInt(dayStr,   10))
  const year  = fullyReduce(parseInt(yearStr,  10))
  const tp    = turningPoint(lifePath.value)

  const c1 = Math.abs(day   - month)
  const c2 = Math.abs(year  - day)
  const c3 = Math.abs(c1    - c2)
  const c4 = Math.abs(month - year)

  const defs: { number: number; start: number; end: number; label: string }[] = [
    { number: c1, start: 0,       end: tp,      label: 'First'          },
    { number: c2, start: tp,      end: tp + 9,  label: 'Second'         },
    { number: c3, start: tp + 9,  end: tp + 18, label: 'Third'          },
    { number: c4, start: tp + 18, end: 99,      label: 'Fourth (Major)' },
  ]

  return defs.map(({ number, start, end, label }) => ({
    number,
    startAge:  start,
    endAge:    end,
    isCurrent: currentAge >= start && currentAge < end,
    label,
  }))
}
