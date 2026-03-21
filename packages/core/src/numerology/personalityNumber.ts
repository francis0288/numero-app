import { isConsonant } from '../utils'
import { reduceNameParts, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** Consonants only (Y counts as a consonant). */
export function calculatePersonality(birthCertName: string): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  const methodA = reduceNameMethodA(parts, isConsonant)
  const methodB = reduceNameParts(parts, isConsonant)
  return {
    methodA: { ...methodA, workings: methodA.workings ? `Phụ âm: ${methodA.workings}` : undefined },
    methodB: { ...methodB, workings: methodB.workings ? `Phụ âm (rút gọn):\n${methodB.workings}` : undefined },
  }
}
