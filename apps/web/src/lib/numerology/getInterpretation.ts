import { prisma } from '@/lib/prisma'

export async function getInterpretation(numberKey: string, category: string) {
  return prisma.mbInterpretation.findUnique({
    where: { numberKey_category: { numberKey, category } },
  })
}

/**
 * Convert a life path / personal year value to the DB key format.
 * Numeric values: 11 → "11/2", 22 → "22/4", 33 → "33/6", others → String(n)
 * Display strings already in correct format: "11/2" → "11/2", "4" → "4"
 */
export function toInterpretationKey(n: number | string): string {
  const s = String(n)
  if (s === '11') return '11/2'
  if (s === '22') return '22/4'
  if (s === '33') return '33/6'
  return s
}
