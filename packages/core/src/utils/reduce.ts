export function sumDigits(n: number): number {
  return String(Math.abs(n))
    .split('')
    .reduce((sum, d) => sum + Number(d), 0)
}

export function isMasterNumber(n: number): boolean {
  return n === 11 || n === 22 || n === 33
}

export function isKarmicDebt(n: number): boolean {
  return n === 13 || n === 14 || n === 16 || n === 19
}

export function reduceToSingleDigit(n: number): number {
  if (n <= 9 || isMasterNumber(n)) return n
  return reduceToSingleDigit(sumDigits(n))
}

export function getCompoundLabel(compound: number, final: number): string {
  if (compound === final) return String(final)
  if (isMasterNumber(final) || isKarmicDebt(compound)) {
    return `${compound}/${final}`
  }
  return String(final)
}
