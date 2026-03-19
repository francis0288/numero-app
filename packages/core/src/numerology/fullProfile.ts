import { calculateLifePath } from './lifePathNumber'
import { calculateDestiny } from './destinyNumber'
import { calculateSoul } from './soulNumber'
import { calculatePersonality } from './personalityNumber'
import { calculateMaturity } from './maturityNumber'
import { calculateBirthDay } from './birthDayNumber'
import { calculateCurrentName } from './currentNameNumber'
import { calculateKarmicLessons } from './karmicLessons'
import type { NumerologyProfile } from '../types'

export interface FullProfileInput {
  birthDate: string
  birthCertName: string
  currentName: string
}

export function calculateFullProfile(input: FullProfileInput): NumerologyProfile {
  const lifePath    = calculateLifePath(input.birthDate)
  const destiny     = calculateDestiny(input.birthCertName)
  const soul        = calculateSoul(input.birthCertName)
  const personality = calculatePersonality(input.birthCertName)
  const maturity    = calculateMaturity(lifePath, destiny)
  const birthDay    = calculateBirthDay(input.birthDate)
  const currentName = calculateCurrentName(input.currentName)
  const karmicLessons = calculateKarmicLessons(input.birthCertName)

  return { lifePath, destiny, soul, personality, maturity, birthDay, currentName, karmicLessons }
}
