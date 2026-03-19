export interface NumberResult {
  value: number
  compound: number
  display: string
  isMasterNumber: boolean
  isKarmicDebt: boolean
  karmicDebtNumber?: number
}

export interface NumerologyProfile {
  lifePath: NumberResult
  destiny: NumberResult
  soul: NumberResult
  personality: NumberResult
  maturity: NumberResult
  birthDay: NumberResult
  currentName: NumberResult
  karmicLessons: number[]
}

export interface ForecastResult {
  value: number
  display: string
  isMasterNumber: boolean
}

export interface LifeCycle {
  number: ForecastResult
  startAge: number
  endAge: number
  isCurrent: boolean
}

export interface Pinnacle {
  number: ForecastResult
  startAge: number
  endAge: number
  isCurrent: boolean
  label: string
}

export interface Challenge {
  number: number
  startAge: number
  endAge: number
  isCurrent: boolean
  label: string
}

export interface ForecastProfile {
  personalYear: ForecastResult
  personalMonth: ForecastResult
  personalDay: ForecastResult
  lifeCycles: LifeCycle[]
  pinnacles: Pinnacle[]
  challenges: Challenge[]
  essenceNumber: ForecastResult
}
