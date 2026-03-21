/**
 * Số Cô Lập — Isolation Number
 *
 * A digit (1–9) is isolated if ALL of:
 *   1. It IS present in the birth date digits
 *   2. It appears only ONCE — digits appearing 2+ times are "strong", not isolated
 *   3. ALL of its 3×3 grid neighbours are ABSENT from the birth date digits
 *
 * 3×3 Pythagorean grid layout:
 *   4 9 2
 *   3 5 7
 *   8 1 6
 *
 * Adjacency (orthogonal + diagonal):
 */

const GRID_NEIGHBORS: Record<number, number[]> = {
  1: [2, 4, 5],
  2: [1, 3, 4, 5, 6],
  3: [2, 5, 6],
  4: [1, 2, 5, 7, 8],
  5: [1, 2, 3, 4, 6, 7, 8, 9],
  6: [2, 3, 5, 8, 9],
  7: [4, 5, 8],
  8: [4, 5, 6, 7, 9],
  9: [5, 6, 8],
}

export function calculateIsolationNumbers(birthDate: string): number[] {
  // Count occurrences of each non-zero digit (1–9) in the birth date string
  const digitCount: Record<number, number> = {}
  for (const ch of birthDate) {
    const d = parseInt(ch, 10)
    if (d >= 1 && d <= 9) {
      digitCount[d] = (digitCount[d] ?? 0) + 1
    }
  }

  const presentDigits = new Set(Object.keys(digitCount).map(Number))

  const isolated: number[] = []
  for (let digit = 1; digit <= 9; digit++) {
    if (!presentDigits.has(digit)) continue
    // Digits appearing 2+ times are "strong" — not isolated
    if (digitCount[digit] > 1) continue
    const allNeighborsAbsent = GRID_NEIGHBORS[digit].every((n) => !presentDigits.has(n))
    if (allNeighborsAbsent) isolated.push(digit)
  }

  return isolated
}
