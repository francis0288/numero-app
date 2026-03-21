import { isMasterNumber, isKarmicDebt, sumDigits, reduceToSingleDigit, getLetterValue } from '../utils'
import type { NumberResult } from '../types'

export interface NameGroup {
  label: string  // e.g. "HỌ", "TÊN ĐỆM", "TÊN"
  value: string  // stripped uppercase, e.g. "LE", "THI", "THANH TINH"
}

export function buildDisplay(compound: number, value: number): string {
  if (isMasterNumber(value)) {
    const base = sumDigits(value)
    return compound === value
      ? `${value}/${base}`
      : `${compound}/${value}/${base}`
  }
  if (isKarmicDebt(compound) && compound !== value) {
    return `${compound}/${value}`
  }
  return String(value)
}

/** Show the digit-reduction steps, e.g. 75 → "7+5=12→1+2=3", 30 → "3+0=3", 22 → "22" */
export function reductionChain(n: number): string {
  if (n <= 9 || isMasterNumber(n)) return String(n)
  const s = sumDigits(n)
  const step = `${String(n).split('').join('+')}=${s}`
  if (s <= 9 || isMasterNumber(s)) return step
  return `${step}→${reductionChain(s)}`
}

export function makeResult(compound: number, value: number, workings?: string): NumberResult {
  return {
    compound,
    value,
    display: buildDisplay(compound, value),
    isMasterNumber: isMasterNumber(value),
    isKarmicDebt: isKarmicDebt(compound),
    karmicDebtNumber: isKarmicDebt(compound) ? compound : undefined,
    workings,
  }
}

/**
 * Method B (Cộng Rút Gọn — Reducing Down):
 * Reduce each name part to a single digit first, then sum and reduce.
 * Generates workings showing per-part breakdown.
 */
export function reduceNameParts(
  parts: string[],
  filter: (char: string) => boolean,
): NumberResult {
  const partData = parts
    .map((part) => {
      const letters = [...part].filter(filter)
      const partSum = letters.reduce((sum, c) => sum + getLetterValue(c), 0)
      const reduced = reduceToSingleDigit(partSum)
      const pairs = letters.map(c => `${c}=${getLetterValue(c)}`).join(' ')
      return { part, letters, partSum, reduced, pairs }
    })
    .filter(d => d.letters.length > 0)

  const compound = partData.reduce((a, d) => a + d.reduced, 0)
  const value = reduceToSingleDigit(compound)

  const partLines = partData.map(d =>
    `${d.part}: ${d.pairs} = ${d.partSum}${d.partSum !== d.reduced ? '→' + d.reduced : ''}`
  )
  const sums = partData.map(d => d.reduced)
  const totalLine = `Tổng: ${sums.join('+')} = ${compound}${compound !== value ? '→' + reductionChain(compound) : ''}`
  const workings = [...partLines, totalLine].join('\n')

  return makeResult(compound, value, workings)
}

/**
 * Method B using semantic name groups (Họ | Tên đệm | Tên).
 * Reduces each group as a whole unit (all letters summed before reducing),
 * regardless of spaces within the group.
 */
export function reduceNameGroups(
  groups: NameGroup[],
  filter: (char: string) => boolean,
): NumberResult {
  const groupData = groups
    .map(({ label, value }) => {
      const letters = [...value.toUpperCase()].filter(filter)
      const partSum = letters.reduce((sum, c) => sum + getLetterValue(c), 0)
      const reduced = reduceToSingleDigit(partSum)
      const pairs = letters.map(c => `${c}=${getLetterValue(c)}`).join(' ')
      return { label, value: value.toUpperCase(), letters, partSum, reduced, pairs }
    })
    .filter(d => d.letters.length > 0)

  if (groupData.length === 0) {
    return makeResult(0, 0, 'Không có ký tự phù hợp')
  }

  const compound = groupData.reduce((a, d) => a + d.reduced, 0)
  const value = reduceToSingleDigit(compound)

  const partLines = groupData.map(d =>
    `${d.label}(${d.value}): ${d.pairs} = ${d.partSum}${d.partSum !== d.reduced ? '→' + reductionChain(d.partSum) : ''}`
  )
  const sums = groupData.map(d => d.reduced)
  const totalLine = `Tổng: ${sums.join('+')} = ${compound}${compound !== value ? '→' + reductionChain(compound) : ''}`
  const workings = [...partLines, totalLine].join('\n')

  return makeResult(compound, value, workings)
}

/**
 * Method A (Cộng Gộp Ngang — Adding Across):
 * Add ALL matching letter values together in one sum, then reduce.
 * Generates workings showing all letters and their values.
 */
export function reduceNameMethodA(
  parts: string[],
  filter: (char: string) => boolean,
): NumberResult {
  const allLetters: string[] = []
  let total = 0
  parts.forEach(part => {
    ;[...part].filter(filter).forEach(c => {
      allLetters.push(`${c}=${getLetterValue(c)}`)
      total += getLetterValue(c)
    })
  })
  const value = reduceToSingleDigit(total)
  const workings = allLetters.length > 0
    ? `${allLetters.join(' ')} = ${total} → ${reductionChain(total)}`
    : 'Không có ký tự phù hợp'
  return makeResult(total, value, workings)
}
