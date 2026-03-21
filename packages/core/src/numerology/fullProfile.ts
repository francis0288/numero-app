import { calculateLifePath } from './lifePathNumber'
import { calculateDestiny } from './destinyNumber'
import { calculateSoul } from './soulNumber'
import { calculatePersonality } from './personalityNumber'
import { calculateMaturity } from './maturityNumber'
import { calculateBirthDay } from './birthDayNumber'
import { calculateCurrentName } from './currentNameNumber'
import { calculateKarmicLessons } from './karmicLessons'
import { calculateAttitude } from './attitudeNumber'
import { calculateBridge } from './bridgeNumber'
import { calculateMotherName } from './motherNameNumber'
import { calculateIsolationNumbers } from './isolationNumber'
import type { NumerologyProfile, NumberResult } from '../types'

export interface FullProfileInput {
  birthDate: string
  birthCertName: string
  currentName: string
  motherName?: string
  nameParts?: {
    lastName: string
    middleName?: string
    firstName: string
  }
}

export function calculateFullProfile(input: FullProfileInput): NumerologyProfile {
  const lifePath    = calculateLifePath(input.birthDate)
  const destiny     = calculateDestiny(input.birthCertName, input.nameParts)
  const soul        = calculateSoul(input.birthCertName, input.nameParts)
  const personality = calculatePersonality(input.birthCertName, input.nameParts)
  const maturity    = calculateMaturity(lifePath, destiny.methodA)
  const birthDay    = calculateBirthDay(input.birthDate)
  const currentName = calculateCurrentName(input.currentName)
  const attitude    = calculateAttitude(input.birthDate)
  const bridge      = calculateBridge(lifePath, destiny.methodA)
  const motherName  = input.motherName ? calculateMotherName(input.motherName) : undefined
  const karmicLessons     = calculateKarmicLessons(input.birthCertName)
  const isolationNumbers  = calculateIsolationNumbers(input.birthDate)

  // Collect all karmic debt numbers from all number results
  const allResults: NumberResult[] = [
    lifePath,
    destiny.methodA, destiny.methodB,
    soul.methodA, soul.methodB,
    personality.methodA, personality.methodB,
    maturity, birthDay, currentName,
  ]
  if (motherName) allResults.push(motherName)
  const karmicDebtNumbers = [...new Set(
    allResults
      .filter(r => r.isKarmicDebt && r.karmicDebtNumber)
      .map(r => r.karmicDebtNumber!)
  )]

  return {
    lifePath,
    destiny,
    soul,
    personality,
    maturity,
    birthDay,
    currentName,
    attitude,
    bridge,
    motherName,
    karmicLessons,
    karmicDebtNumbers,
    isolationNumbers,
  }
}
