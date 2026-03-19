import { calculatePersonalYear, calculatePersonalMonth, calculatePersonalDay } from './personalNumbers'
import { calculateLifeCycles } from './lifeCycles'
import { calculatePinnacles } from './pinnacles'
import { calculateChallenges } from './challenges'
import { calculateEssence } from './essenceNumber'
import { computeAge } from './_forecastHelpers'
import type { ForecastProfile, NumberResult } from '../types'

export interface FullForecastInput {
  birthDate: string
  birthCertName: string
  lifePath: NumberResult
  /** ISO date string "YYYY-MM-DD". Defaults to today if omitted. */
  targetDate?: string
}

export function calculateFullForecast(input: FullForecastInput): ForecastProfile {
  const refDate = input.targetDate ? new Date(input.targetDate) : new Date()
  const currentAge = computeAge(input.birthDate, refDate)

  const personalYear  = calculatePersonalYear(input.birthDate, refDate.getFullYear())
  const personalMonth = calculatePersonalMonth(personalYear, refDate.getMonth() + 1)
  const personalDay   = calculatePersonalDay(personalMonth, refDate.getDate())
  const lifeCycles    = calculateLifeCycles(input.birthDate, input.lifePath, currentAge)
  const pinnacles     = calculatePinnacles(input.birthDate, input.lifePath, currentAge)
  const challenges    = calculateChallenges(input.birthDate, input.lifePath, currentAge)
  const essenceNumber = calculateEssence(input.birthCertName, currentAge)

  return {
    personalYear,
    personalMonth,
    personalDay,
    lifeCycles,
    pinnacles,
    challenges,
    essenceNumber,
  }
}
