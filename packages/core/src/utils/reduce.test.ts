import { describe, it, expect } from 'vitest'
import { reduceToSingleDigit, sumDigits, isMasterNumber, isKarmicDebt, getCompoundLabel } from './reduce'

describe('sumDigits', () => {
  it('sums digits of 1969', () => expect(sumDigits(1969)).toBe(25))
  it('sums digits of 12', () => expect(sumDigits(12)).toBe(3))
})

describe('isMasterNumber', () => {
  it('11 is master', () => expect(isMasterNumber(11)).toBe(true))
  it('22 is master', () => expect(isMasterNumber(22)).toBe(true))
  it('33 is master', () => expect(isMasterNumber(33)).toBe(true))
  it('4 is not master', () => expect(isMasterNumber(4)).toBe(false))
})

describe('isKarmicDebt', () => {
  it('13 is karmic', () => expect(isKarmicDebt(13)).toBe(true))
  it('14 is karmic', () => expect(isKarmicDebt(14)).toBe(true))
  it('16 is karmic', () => expect(isKarmicDebt(16)).toBe(true))
  it('19 is karmic', () => expect(isKarmicDebt(19)).toBe(true))
  it('7 is not karmic', () => expect(isKarmicDebt(7)).toBe(false))
})

describe('reduceToSingleDigit', () => {
  it('29 → 11 (Master Number, stop)', () => expect(reduceToSingleDigit(29)).toBe(11))
  it('38 → 11 (3+8=11, stop)', () => expect(reduceToSingleDigit(38)).toBe(11))
  it('33 → 33 (already Master)', () => expect(reduceToSingleDigit(33)).toBe(33))
  it('22 → 22 (already Master)', () => expect(reduceToSingleDigit(22)).toBe(22))
  it('34 → 7', () => expect(reduceToSingleDigit(34)).toBe(7))
  it('256 → 4', () => expect(reduceToSingleDigit(256)).toBe(4))
  it('1 → 1', () => expect(reduceToSingleDigit(1)).toBe(1))
})

describe('getCompoundLabel', () => {
  it('compound === final returns single string', () => expect(getCompoundLabel(7, 7)).toBe('7'))
  it('master final returns compound/final', () => expect(getCompoundLabel(29, 11)).toBe('29/11'))
  it('karmic debt compound returns compound/final', () => expect(getCompoundLabel(13, 4)).toBe('13/4'))
  it('ordinary reduction returns final only', () => expect(getCompoundLabel(34, 7)).toBe('7'))
})
