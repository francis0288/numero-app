/**
 * World Year Number (Năm Thế Giới) — David Phillips system
 * Formula: sum all 4 digits of the year, then reduce to single digit
 * Source: "The Complete Book of Numerology" — David Phillips
 *
 * Examples:
 *   2026 → 2+0+2+6 = 10 → 1+0 = 1
 *   2025 → 2+0+2+5 = 9
 *   2024 → 2+0+2+4 = 8
 *
 * Note: David Phillips reduces all the way to a single digit (1–9).
 * Unlike Personal Year, World Year Number does NOT keep Master Numbers.
 */

export function calculateWorldYearNumber(year: number): number {
  const digits = String(year).split('').map(Number);
  let sum = digits.reduce((a, d) => a + d, 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce((a, d) => a + Number(d), 0);
  }
  return sum;
}

/**
 * Returns display label for World Year
 * e.g. "Năm Thế Giới 2026: 1"
 */
export function worldYearLabel(year: number): string {
  const num = calculateWorldYearNumber(year);
  return `Năm Thế Giới ${year}: ${num}`;
}

// Pre-calculated values for reference:
// 2023 → 7  |  2024 → 8  |  2025 → 9  |  2026 → 1  |  2027 → 2  |  2028 → 3
