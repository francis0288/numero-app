import { getLetterValue } from '../utils'

/**
 * Returns digits 1–9 that are absent from the birth certificate name.
 * Any digit not represented by at least one letter is a karmic lesson.
 */
export function calculateKarmicLessons(birthCertName: string): number[] {
  const present = new Set<number>()

  for (const char of birthCertName.toUpperCase()) {
    const v = getLetterValue(char)
    if (v > 0) present.add(v)
  }

  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !present.has(n))
}
