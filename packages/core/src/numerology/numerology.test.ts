import { describe, it, expect } from 'vitest'
import { calculateLifePath } from './lifePathNumber'
import { calculateDestiny } from './destinyNumber'
import { calculateSoul } from './soulNumber'
import { calculatePersonality } from './personalityNumber'
import { calculateMaturity } from './maturityNumber'
import { calculateBirthDay } from './birthDayNumber'
import { calculateKarmicLessons } from './karmicLessons'
import { calculateFullProfile } from './fullProfile'

// ---------------------------------------------------------------------------
// Life Path
// ---------------------------------------------------------------------------
describe('calculateLifePath', () => {
  it('1969-12-11 → 3', () => {
    const r = calculateLifePath('1969-12-11')
    expect(r.value).toBe(3)
    expect(r.display).toBe('3')
  })

  it('1960-02-02 → 11 (Master Number)', () => {
    const r = calculateLifePath('1960-02-02')
    expect(r.value).toBe(11)
    expect(r.display).toBe('11/2')
    expect(r.isMasterNumber).toBe(true)
  })

  it('1983-06-24 → 6', () => {
    const r = calculateLifePath('1983-06-24')
    expect(r.value).toBe(6)
    expect(r.display).toBe('6')
  })
})

// ---------------------------------------------------------------------------
// Destiny
// ---------------------------------------------------------------------------
describe('calculateDestiny', () => {
  it('MARY ANN SMITH → 2', () => {
    const r = calculateDestiny('MARY ANN SMITH')
    expect(r.value).toBe(2)
    expect(r.display).toBe('2')
  })
})

// ---------------------------------------------------------------------------
// Soul
// ---------------------------------------------------------------------------
describe('calculateSoul', () => {
  it('MARY ANN SMITH → 11 (Master Number)', () => {
    const r = calculateSoul('MARY ANN SMITH')
    expect(r.value).toBe(11)
    expect(r.display).toBe('11/2')
    expect(r.isMasterNumber).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Personality
// ---------------------------------------------------------------------------
describe('calculatePersonality', () => {
  it('MARY ANN SMITH → 9', () => {
    const r = calculatePersonality('MARY ANN SMITH')
    expect(r.value).toBe(9)
    expect(r.display).toBe('9')
  })
})

// ---------------------------------------------------------------------------
// Maturity
// ---------------------------------------------------------------------------
describe('calculateMaturity', () => {
  it('lifePath=3, destiny=2 → 5', () => {
    const lp = calculateLifePath('1969-12-11') // value=3
    const d  = calculateDestiny('MARY ANN SMITH') // value=2
    const r  = calculateMaturity(lp, d)
    expect(r.value).toBe(5)
    expect(r.display).toBe('5')
  })
})

// ---------------------------------------------------------------------------
// Birth Day
// ---------------------------------------------------------------------------
describe('calculateBirthDay', () => {
  it('day=24 → 6', () => {
    const r = calculateBirthDay('1983-06-24')
    expect(r.value).toBe(6)
    expect(r.display).toBe('6')
  })

  it('day=11 → 11 (Master Number)', () => {
    const r = calculateBirthDay('1990-03-11')
    expect(r.value).toBe(11)
    expect(r.display).toBe('11/2')
    expect(r.isMasterNumber).toBe(true)
  })

  it('day=29 → 11 (compound=29)', () => {
    const r = calculateBirthDay('1985-09-29')
    expect(r.value).toBe(11)
    expect(r.compound).toBe(29)
    expect(r.display).toBe('29/11/2')
    expect(r.isMasterNumber).toBe(true)
  })

  it('day=22 → 22 (Master Number)', () => {
    const r = calculateBirthDay('1954-02-22')
    expect(r.value).toBe(22)
    expect(r.display).toBe('22/4')
    expect(r.isMasterNumber).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Karmic Lessons
// ---------------------------------------------------------------------------
describe('calculateKarmicLessons', () => {
  it('MARY ANN SMITH → missing [3, 6]', () => {
    // Values present: M=4,A=1,R=9,Y=7,N=5,S=1,I=9,T=2,H=8 → {1,2,4,5,7,8,9}
    // Missing: 3, 6
    expect(calculateKarmicLessons('MARY ANN SMITH')).toEqual([3, 6])
  })
})

// ---------------------------------------------------------------------------
// Full Profile
// ---------------------------------------------------------------------------
describe('calculateFullProfile', () => {
  it('produces correct values for the reference inputs', () => {
    const profile = calculateFullProfile({
      birthDate: '1969-12-11',
      birthCertName: 'MARY ANN SMITH',
      currentName: 'MARY SMITH',
    })

    expect(profile.lifePath.value).toBe(3)
    expect(profile.destiny.value).toBe(2)
    expect(profile.soul.value).toBe(11)
    expect(profile.personality.value).toBe(9)
    expect(profile.birthDay.value).toBe(11)
    expect(profile.karmicLessons).toEqual([3, 6])
  })
})
