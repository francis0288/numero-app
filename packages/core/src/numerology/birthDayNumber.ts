import { reduceToSingleDigit } from '../utils'
import { makeResult } from './_helpers'
import type { NumberResult } from '../types'

/**
 * The birthday number is simply the day of birth, with special treatment for
 * master numbers (11, 22) and numbers that reduce to a master (e.g. 29 → 11).
 *
 * compound = the raw day number (e.g. 29)
 * value    = reduceToSingleDigit(day) respecting master numbers (e.g. 11)
 */
export function calculateBirthDay(birthDate: string): NumberResult {
  const day = parseInt(birthDate.split('-')[2], 10)
  const value = reduceToSingleDigit(day)
  return makeResult(day, value)
}
