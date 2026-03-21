import { reduceNameParts, reduceNameGroups, reduceNameMethodA } from './_helpers'
import type { DestinyResult } from '../types'

/** All letters (A–Z) count — uses every letter in the birth certificate name. */
export function calculateDestiny(
  birthCertName: string,
  nameParts?: { lastName: string; middleName?: string; firstName: string },
): DestinyResult {
  const parts = birthCertName.toUpperCase().split(' ').filter(Boolean)
  const filter = (c: string) => /[A-Z]/.test(c)
  const methodA = reduceNameMethodA(parts, filter)

  const methodB = nameParts
    ? reduceNameGroups(
        [
          { label: 'HỌ', value: nameParts.lastName },
          ...(nameParts.middleName ? [{ label: 'TÊN ĐỆM', value: nameParts.middleName }] : []),
          { label: 'TÊN', value: nameParts.firstName },
        ],
        filter,
      )
    : reduceNameParts(parts, filter)

  return {
    methodA: { ...methodA, workings: methodA.workings ? `Tất cả chữ cái:\n${methodA.workings}` : undefined },
    methodB: { ...methodB, workings: methodB.workings ? `Cộng rút gọn:\n${methodB.workings}` : undefined },
  }
}
