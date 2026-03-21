import { isVowel } from '../utils'
import { reduceNameParts, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** Vowels only (A E I O U — Y is consonant). */
export function calculateSoul(birthCertName: string): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  return {
    methodA: reduceNameMethodA(parts, isVowel),
    methodB: reduceNameParts(parts, isVowel),
  }
}
