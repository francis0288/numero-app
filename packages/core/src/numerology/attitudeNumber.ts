import { reduceToSingleDigit } from '../utils'
import { makeResult } from './_helpers'
import type { NumberResult } from '../types'

/**
 * Attitude Number (CS Thái Độ):
 * fullDay + fullMonth → reduce (no pre-reduction of either part)
 * Reveals the attitude and first impression a person gives to others.
 */
export function calculateAttitude(birthDate: string): NumberResult {
  const [, monthStr, dayStr] = birthDate.split('-')
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  const compound = month + day
  const value = reduceToSingleDigit(compound)
  return makeResult(compound, value)
}
