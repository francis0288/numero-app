import { reduceToSingleDigit, getLetterValue } from '../utils'
import { makeResult } from './_helpers'
import type { NumberResult } from '../types'

/**
 * Mother's Name Number (CS Tên Mẹ):
 * Same as Destiny Method A — add all letter values together, then reduce.
 * Optional — only calculated if the practitioner enters the mother's name.
 */
export function calculateMotherName(motherName: string): NumberResult {
  const letters = [...motherName.toUpperCase()].filter(c => /[A-Z]/.test(c))
  const total = letters.reduce((sum, c) => sum + getLetterValue(c), 0)
  const value = reduceToSingleDigit(total)
  return makeResult(total, value)
}
