import { reduceNameParts, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** All letters (A–Z) count — uses every letter in the birth certificate name. */
export function calculateDestiny(birthCertName: string): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  const filter = (c: string) => /[A-Z]/.test(c)
  return {
    methodA: reduceNameMethodA(parts, filter),
    methodB: reduceNameParts(parts, filter),
  }
}
