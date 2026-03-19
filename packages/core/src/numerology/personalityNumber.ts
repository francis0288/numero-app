import { isConsonant } from '../utils'
import { reduceNameParts } from './_helpers'
import type { NumberResult } from '../types'

/** Consonants only (Y counts as a consonant). */
export function calculatePersonality(birthCertName: string): NumberResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  return reduceNameParts(parts, isConsonant)
}
