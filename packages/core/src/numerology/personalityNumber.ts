import { isConsonant } from '../utils'
import { reduceNameParts, reduceNameGroups, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** Consonants only (Y counts as a consonant). */
export function calculatePersonality(
  birthCertName: string,
  nameParts?: { lastName: string; middleName?: string; firstName: string },
): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  const methodA = reduceNameMethodA(parts, isConsonant)

  const methodB = nameParts
    ? reduceNameGroups(
        [
          { label: 'HỌ', value: nameParts.lastName },
          ...(nameParts.middleName ? [{ label: 'TÊN ĐỆM', value: nameParts.middleName }] : []),
          { label: 'TÊN', value: nameParts.firstName },
        ],
        isConsonant,
      )
    : reduceNameParts(parts, isConsonant)

  return {
    methodA: { ...methodA, workings: methodA.workings ? `Phụ âm: ${methodA.workings}` : undefined },
    methodB: { ...methodB, workings: methodB.workings ? `Phụ âm (rút gọn):\n${methodB.workings}` : undefined },
  }
}
