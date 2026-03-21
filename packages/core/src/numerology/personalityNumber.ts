import { isConsonant } from '../utils'
import { reduceNameParts, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** Consonants only (Y counts as a consonant). */
export function calculatePersonality(birthCertName: string): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  return {
    methodA: reduceNameMethodA(parts, isConsonant),
    methodB: reduceNameParts(parts, isConsonant),
  }
}
