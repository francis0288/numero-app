import { describe, it, expect } from 'vitest'
import { calculatePersonalYear, calculatePersonalMonth, calculatePersonalDay } from './personalNumbers'
import { calculateLifeCycles } from './lifeCycles'
import { calculatePinnacles } from './pinnacles'
import { calculateChallenges } from './challenges'
import { calculateLifePath } from '../numerology/lifePathNumber'

// Shared fixtures
const LP_1969 = calculateLifePath('1969-12-11') // value: 3
const LP_1960 = calculateLifePath('1960-02-02') // value: 11

// ---------------------------------------------------------------------------
// Personal Year
// Formula: sum ALL individual digits of day + month + full 4-digit year → reduce
// ---------------------------------------------------------------------------
describe('calculatePersonalYear', () => {
  it('1969-12-11 in 2026: 1+1+1+2+2+0+2+6=15 → 6', () => {
    expect(calculatePersonalYear('1969-12-11', 2026).value).toBe(6)
  })

  it('1960-02-02 in 2026: 0+2+0+2+2+0+2+6=14 → 5', () => {
    expect(calculatePersonalYear('1960-02-02', 2026).value).toBe(5)
  })

  it('1983-06-24 in 2026: 2+4+0+6+2+0+2+6=22 → 22 (Master Number)', () => {
    const r = calculatePersonalYear('1983-06-24', 2026)
    expect(r.value).toBe(22)
    expect(r.isMasterNumber).toBe(true)
  })

  it('born April 13, year 2026: 1+3+0+4+2+0+2+6=18 → 9', () => {
    expect(calculatePersonalYear('1984-04-13', 2026).value).toBe(9)
  })

  it('born October 29, year 2026: 2+9+1+0+2+0+2+6=22 → 22 (Master Number)', () => {
    const r = calculatePersonalYear('1985-10-29', 2026)
    expect(r.value).toBe(22)
    expect(r.isMasterNumber).toBe(true)
  })

  it('born March 9, year 2026: 0+9+0+3+2+0+2+6=22 → 22 (Master Number)', () => {
    const r = calculatePersonalYear('1990-03-09', 2026)
    expect(r.value).toBe(22)
    expect(r.isMasterNumber).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Personal Month
// ---------------------------------------------------------------------------
describe('calculatePersonalMonth', () => {
  it('PY=6 (1969-12-11 in 2026) + month=3 → 9', () => {
    const py = calculatePersonalYear('1969-12-11', 2026) // value=6 (new formula)
    expect(py.value).toBe(6)
    expect(calculatePersonalMonth(py, 3).value).toBe(9)
  })

  it('PY=9 + month=12 → 3 (9+12=21→3)', () => {
    const stub = { value: 9, display: '9', isMasterNumber: false }
    expect(calculatePersonalMonth(stub, 12).value).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Personal Day
// ---------------------------------------------------------------------------
describe('calculatePersonalDay', () => {
  it('PM=9 + day=18 → 9 (9+18=27→9)', () => {
    const pm = { value: 9, display: '9', isMasterNumber: false }
    expect(calculatePersonalDay(pm, 18).value).toBe(9)
  })

  it('PM=3 + day=1 → 4', () => {
    const pm = { value: 3, display: '3', isMasterNumber: false }
    expect(calculatePersonalDay(pm, 1).value).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// Life Cycles — birthDate:"1969-12-11", lifePath.value:3
// turningPoint = 36-3 = 33
// First:  month=12→3  ages 0-33
// Second: day=11→2    ages 33-60  (fully reduced: 11→2)
// Third:  year=1969→7 ages 60-99
// ---------------------------------------------------------------------------
describe('calculateLifeCycles', () => {
  const cycles = calculateLifeCycles('1969-12-11', LP_1969, 55)

  it('first cycle: value=3, ages 0–33', () => {
    expect(cycles[0].number.value).toBe(3)
    expect(cycles[0].startAge).toBe(0)
    expect(cycles[0].endAge).toBe(33)
  })

  it('second cycle: value=2 (day=11 fully reduced), ages 33–60', () => {
    expect(cycles[1].number.value).toBe(2)
    expect(cycles[1].startAge).toBe(33)
    expect(cycles[1].endAge).toBe(60)
  })

  it('third cycle: value=7 (year=1969→25→7), startAge=60', () => {
    expect(cycles[2].number.value).toBe(7)
    expect(cycles[2].startAge).toBe(60)
  })

  it('isCurrent flags are correct at age 55', () => {
    expect(cycles[0].isCurrent).toBe(false)
    expect(cycles[1].isCurrent).toBe(true)  // 33 <= 55 < 60
    expect(cycles[2].isCurrent).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Pinnacles — birthDate:"1969-12-11", lifePath.value:3
// month=3, day=2, year=7, turningPoint=33
// First:  3+2=5    0-33
// Second: 2+7=9    33-42
// Third:  5+9=14→5 42-51
// Fourth: 3+7=10→1 51-99
// ---------------------------------------------------------------------------
describe('calculatePinnacles', () => {
  const pins = calculatePinnacles('1969-12-11', LP_1969, 55)

  it('pinnacle 1: value=5, First, ages 0–33', () => {
    expect(pins[0].number.value).toBe(5)
    expect(pins[0].label).toBe('First')
    expect(pins[0].startAge).toBe(0)
    expect(pins[0].endAge).toBe(33)
  })

  it('pinnacle 2: value=9, Second, ages 33–42', () => {
    expect(pins[1].number.value).toBe(9)
    expect(pins[1].label).toBe('Second')
    expect(pins[1].startAge).toBe(33)
    expect(pins[1].endAge).toBe(42)
  })

  it('pinnacle 3: value=5, Third, ages 42–51', () => {
    expect(pins[2].number.value).toBe(5)
    expect(pins[2].label).toBe('Third')
    expect(pins[2].startAge).toBe(42)
    expect(pins[2].endAge).toBe(51)
  })

  it('pinnacle 4: value=1, Fourth, ages 51+', () => {
    expect(pins[3].number.value).toBe(1)
    expect(pins[3].label).toBe('Fourth')
    expect(pins[3].startAge).toBe(51)
  })

  it('isCurrent flags correct at age 55 (in fourth pinnacle)', () => {
    expect(pins[0].isCurrent).toBe(false)
    expect(pins[1].isCurrent).toBe(false)
    expect(pins[2].isCurrent).toBe(false)
    expect(pins[3].isCurrent).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Challenges — birthDate:"1969-12-11", lifePath.value:3
// month=3, day=2, year=7
// First:  |2-3|=1
// Second: |7-2|=5
// Third:  |1-5|=4
// Fourth: |3-7|=4
// ---------------------------------------------------------------------------
describe('calculateChallenges', () => {
  const chals = calculateChallenges('1969-12-11', LP_1969, 55)

  it('challenge 1: number=1', () => expect(chals[0].number).toBe(1))
  it('challenge 2: number=5', () => expect(chals[1].number).toBe(5))
  it('challenge 3 (Major): number=4', () => expect(chals[2].number).toBe(4))
  it('challenge 4: number=4', () => expect(chals[3].number).toBe(4))

  it('challenge labels', () => {
    expect(chals[0].label).toBe('First')
    expect(chals[1].label).toBe('Second')
    expect(chals[2].label).toBe('Third')
    expect(chals[3].label).toBe('Fourth (Major)')
  })
})
