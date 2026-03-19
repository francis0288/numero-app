export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

export function getLetterValue(char: string): number {
  return PYTHAGOREAN_MAP[char.toUpperCase()] ?? 0
}

export function isVowel(char: string): boolean {
  return VOWELS.has(char.toUpperCase())
}

export function isConsonant(char: string): boolean {
  const upper = char.toUpperCase()
  return upper in PYTHAGOREAN_MAP && !VOWELS.has(upper)
}
