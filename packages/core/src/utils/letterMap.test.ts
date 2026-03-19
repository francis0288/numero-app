import { describe, it, expect } from 'vitest'
import { getLetterValue, isVowel, isConsonant } from './letterMap'

describe('getLetterValue', () => {
  it('A = 1', () => expect(getLetterValue('A')).toBe(1))
  it('a = 1 (lowercase)', () => expect(getLetterValue('a')).toBe(1))
  it('S = 1', () => expect(getLetterValue('S')).toBe(1))
  it('Z = 8', () => expect(getLetterValue('Z')).toBe(8))
  it('space = 0', () => expect(getLetterValue(' ')).toBe(0))
  it('hyphen = 0', () => expect(getLetterValue('-')).toBe(0))
})

describe('isVowel', () => {
  it('A is vowel', () => expect(isVowel('A')).toBe(true))
  it('E is vowel', () => expect(isVowel('E')).toBe(true))
  it('I is vowel', () => expect(isVowel('I')).toBe(true))
  it('O is vowel', () => expect(isVowel('O')).toBe(true))
  it('U is vowel', () => expect(isVowel('U')).toBe(true))
  it('Y is NOT a vowel', () => expect(isVowel('Y')).toBe(false))
  it('B is not a vowel', () => expect(isVowel('B')).toBe(false))
})

describe('isConsonant', () => {
  it('B is consonant', () => expect(isConsonant('B')).toBe(true))
  it('S is consonant', () => expect(isConsonant('S')).toBe(true))
  it('Y is consonant', () => expect(isConsonant('Y')).toBe(true))
  it('A is not consonant', () => expect(isConsonant('A')).toBe(false))
  it('space is not consonant', () => expect(isConsonant(' ')).toBe(false))
})
