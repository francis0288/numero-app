import { reduceToSingleDigit } from '../utils'
import { makeResult } from './_helpers'
import type { NumberResult } from '../types'

/**
 * Reducing-down method:
 * 1. Reduce month, day, year each separately (keep 11 / 22 if they arise)
 * 2. Sum the three reduced parts
 * 3. Reduce the total (keep 11, 22, 33)
 */
export function calculateLifePath(birthDate: string): NumberResult {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const rMonth = reduceToSingleDigit(parseInt(monthStr, 10))
  const rDay   = reduceToSingleDigit(parseInt(dayStr,   10))
  const rYear  = reduceToSingleDigit(parseInt(yearStr,  10))

  const compound = rMonth + rDay + rYear
  const value    = reduceToSingleDigit(compound)
  return makeResult(compound, value)
}
