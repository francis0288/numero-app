export interface NumberResult {
  value: number
  compound: number
  display: string
  isMasterNumber: boolean
  isKarmicDebt: boolean
  karmicDebtNumber?: number
  workings?: string
}

export interface DestinyResult {
  methodA: NumberResult  // Adding across (Cộng gộp ngang)
  methodB: NumberResult  // Reducing down (Cộng rút gọn)
}

export interface NumerologyProfile {
  lifePath: NumberResult
  destiny: DestinyResult
  soul: DestinyResult
  personality: DestinyResult
  maturity: NumberResult
  birthDay: NumberResult
  currentName: NumberResult
  attitude: NumberResult
  bridge: NumberResult
  motherName?: NumberResult
  karmicLessons: number[]
  karmicDebtNumbers: number[]
  isolationNumbers: number[]
}

export interface ForecastResult {
  value: number
  display: string
  isMasterNumber: boolean
  workings?: string
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
