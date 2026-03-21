import { isVowel } from '../utils'
import { reduceNameParts, reduceNameGroups, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** Vowels only (A E I O U — Y is consonant). */
export function calculateSoul(
  birthCertName: string,
  nameParts?: { lastName: string; middleName?: string; firstName: string },
): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  const methodA = reduceNameMethodA(parts, isVowel)

  const methodB = nameParts
    ? reduceNameGroups(
        [
          { label: 'HỌ', value: nameParts.lastName },
          ...(nameParts.middleName ? [{ label: 'TÊN ĐỆM', value: nameParts.middleName }] : []),
          { label: 'TÊN', value: nameParts.firstName },
        ],
        isVowel,
      )
    : reduceNameParts(parts, isVowel)

  return {
    methodA: { ...methodA, workings: methodA.workings ? `Nguyên âm: ${methodA.workings}` : undefined },
    methodB: { ...methodB, workings: methodB.workings ? `Nguyên âm (rút gọn):\n${methodB.workings}` : undefined },
  }
}
