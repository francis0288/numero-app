import { reduceNameParts } from './_helpers'
import type { NumberResult } from '../types'

/** All letters (A–Z) count — uses every letter in the birth certificate name. */
export function calculateDestiny(birthCertName: string): NumberResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  return reduceNameParts(parts, (c) => /[A-Z]/.test(c))
}
