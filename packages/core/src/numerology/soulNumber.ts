import { isVowel } from '../utils'
import { reduceNameParts, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** Vowels only (A E I O U — Y is consonant). */
export function calculateSoul(birthCertName: string): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  const methodA = reduceNameMethodA(parts, isVowel)
  const methodB = reduceNameParts(parts, isVowel)
  return {
    methodA: { ...methodA, workings: methodA.workings ? `Nguyên âm: ${methodA.workings}` : undefined },
    methodB: { ...methodB, workings: methodB.workings ? `Nguyên âm (rút gọn):\n${methodB.workings}` : undefined },
  }
}
