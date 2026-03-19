import { reduceNameParts } from './_helpers'
import type { NumberResult } from '../types'

/** Identical logic to Destiny — uses the name the person currently goes by. */
export function calculateCurrentName(currentName: string): NumberResult {
  const parts = currentName.toUpperCase().split(' ').filter(Boolean)
  return reduceNameParts(parts, (c) => /[A-Z]/.test(c))
}
