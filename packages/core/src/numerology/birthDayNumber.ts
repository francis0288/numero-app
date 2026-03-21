import { reduceToSingleDigit } from '../utils'
import { makeResult, reductionChain } from './_helpers'
import type { NumberResult } from '../types'

/**
 * The birthday number is simply the day of birth, with special treatment for
 * master numbers (11, 22) and numbers that reduce to a master (e.g. 29 → 11).
 */
export function calculateBirthDay(birthDate: string): NumberResult {
  const day   = parseInt(birthDate.split('-')[2], 10)
  const value = reduceToSingleDigit(day)

  const workings = day === value
    ? `Ngày ${day}`
    : `Ngày ${day} → ${reductionChain(day)}`

  return makeResult(day, value, workings)
}
