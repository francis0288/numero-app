import { isVowel } from '../utils'
import { reduceNameParts } from './_helpers'
import type { NumberResult } from '../types'

/** Vowels only (A E I O U — Y is consonant). */
export function calculateSoul(birthCertName: string): NumberResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  return reduceNameParts(parts, isVowel)
}
