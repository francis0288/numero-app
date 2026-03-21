import { describe, it, expect } from 'vitest'
import { calculateLifePath } from './lifePathNumber'
import { calculateDestiny } from './destinyNumber'
import { calculateSoul } from './soulNumber'
import { calculatePersonality } from './personalityNumber'
import { calculateMaturity } from './maturityNumber'
import { calculateBirthDay } from './birthDayNumber'
import { calculateKarmicLessons } from './karmicLessons'
import { calculateAttitude } from './attitudeNumber'
import { calculateBridge } from './bridgeNumber'
import { calculateMotherName } from './motherNameNumber'
import { calculateFullProfile } from './fullProfile'
import { calculateIsolationNumbers } from './isolationNumber'

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
// Destiny — both methods
// MARY ANN SMITH:
//   Method A (adding across): M=4+A=1+R=9+Y=7+A=1+N=5+N=5+S=1+M=4+I=9+T=2+H=8 = 56 → 11/2
//   Method B (reducing down): MARY=3, ANN=11→reduce→11, SMITH=6 → 3+11+6=20 → 2
// ---------------------------------------------------------------------------
describe('calculateDestiny', () => {
  it('MARY ANN SMITH Method A (adding across) → 56/11/2', () => {
    const r = calculateDestiny('MARY ANN SMITH')
    expect(r.methodA.value).toBe(11)
    expect(r.methodA.display).toBe('56/11/2')
    expect(r.methodA.isMasterNumber).toBe(true)
  })

  it('MARY ANN SMITH Method B (reducing down) → 2', () => {
    const r = calculateDestiny('MARY ANN SMITH')
    expect(r.methodB.value).toBe(2)
    expect(r.methodB.display).toBe('2')
  })
})

// ---------------------------------------------------------------------------
// Soul — both methods
// MARY ANN SMITH vowels: A(MARY)=1, A(ANN)=1, I(SMITH)=9
//   Method A: 1+1+9 = 11 → 11/2
//   Method B: [1]→1, [1]→1, [9]→9 → 1+1+9=11 → 11/2  (same here)
// ---------------------------------------------------------------------------
describe('calculateSoul', () => {
  it('MARY ANN SMITH Method A → 11/2', () => {
    const r = calculateSoul('MARY ANN SMITH')
    expect(r.methodA.value).toBe(11)
    expect(r.methodA.isMasterNumber).toBe(true)
  })

  it('MARY ANN SMITH Method B → 11/2', () => {
    const r = calculateSoul('MARY ANN SMITH')
    expect(r.methodB.value).toBe(11)
    expect(r.methodB.isMasterNumber).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Personality — both methods
// MARY ANN SMITH consonants: M=4,R=9,Y=7, N=5,N=5, S=1,M=4,T=2,H=8
//   Method A: 4+9+7+5+5+1+4+2+8 = 45 → 9
//   Method B: MARY=4+9+7=20→2, ANN=5+5=10→1, SMITH=1+4+2+8=15→6 → 2+1+6=9
// ---------------------------------------------------------------------------
describe('calculatePersonality', () => {
  it('MARY ANN SMITH Method A → 9', () => {
    const r = calculatePersonality('MARY ANN SMITH')
    expect(r.methodA.value).toBe(9)
    expect(r.methodA.display).toBe('9')
  })

  it('MARY ANN SMITH Method B → 9', () => {
    const r = calculatePersonality('MARY ANN SMITH')
    expect(r.methodB.value).toBe(9)
    expect(r.methodB.display).toBe('9')
  })
})

// ---------------------------------------------------------------------------
// Maturity — uses destiny.methodA
// ---------------------------------------------------------------------------
describe('calculateMaturity', () => {
  it('lifePath=3, destinyMethodA=11/2 (base=2) → 5', () => {
    const lp = calculateLifePath('1969-12-11') // value=3
    const d  = calculateDestiny('MARY ANN SMITH').methodA // value=11, base=2
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
    expect(calculateKarmicLessons('MARY ANN SMITH')).toEqual([3, 6])
  })
})

// ---------------------------------------------------------------------------
// Attitude Number
// Formula: rawDay + rawMonth → reduce (with master awareness)
// ---------------------------------------------------------------------------
describe('calculateAttitude', () => {
  it('born April 13 → 13+4=17 → 8', () => {
    expect(calculateAttitude('1984-04-13').value).toBe(8)
  })

  it('born October 20 → 20+10=30 → 3', () => {
    expect(calculateAttitude('1987-10-20').value).toBe(3)
  })

  it('born February 29 → 29+2=31 → 4', () => {
    expect(calculateAttitude('1988-02-29').value).toBe(4)
  })

  it('born February 9 → 9+2=11 → 11 (Master Number)', () => {
    const r = calculateAttitude('1990-02-09')
    expect(r.value).toBe(11)
    expect(r.isMasterNumber).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Bridge Number
// Formula: |lifePath base value - destiny methodA base value|
// ---------------------------------------------------------------------------
describe('calculateBridge', () => {
  it('Life Path 3, Destiny Method A 11/2 (base=2) → |3-2|=1', () => {
    const lp = calculateLifePath('1969-12-11') // value=3
    const d  = calculateDestiny('MARY ANN SMITH').methodA // value=11, base=2
    expect(calculateBridge(lp, d).value).toBe(1)
  })

  it('Life Path 7, Destiny 3 → |7-3|=4', () => {
    const lp = { value: 7, compound: 7, display: '7', isMasterNumber: false, isKarmicDebt: false }
    const d  = { value: 3, compound: 3, display: '3', isMasterNumber: false, isKarmicDebt: false }
    expect(calculateBridge(lp, d).value).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// Mother's Name Number
// Same as Destiny Method A — add all letters, reduce
// ---------------------------------------------------------------------------
describe('calculateMotherName', () => {
  it('NGUYEN THI HOA: N=5+G=7+U=3+Y=7+E=5+N=5+T=2+H=8+I=9+H=8+O=6+A=1 = 66 → 3', () => {
    const r = calculateMotherName('NGUYEN THI HOA')
    expect(r.value).toBe(3)
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
    expect(profile.destiny.methodA.value).toBe(11)
    expect(profile.destiny.methodA.isMasterNumber).toBe(true)
    expect(profile.destiny.methodB.value).toBe(2)
    expect(profile.soul.methodA.value).toBe(11)
    expect(profile.soul.methodB.value).toBe(11)
    expect(profile.personality.methodA.value).toBe(9)
    expect(profile.personality.methodB.value).toBe(9)
    expect(profile.maturity.value).toBe(5)
    expect(profile.birthDay.value).toBe(11)
    expect(profile.karmicLessons).toEqual([3, 6])
    expect(Array.isArray(profile.karmicDebtNumbers)).toBe(true)
  })

  it('attitude: born 1969-12-11 → 11+12=23 → 5', () => {
    const profile = calculateFullProfile({
      birthDate: '1969-12-11',
      birthCertName: 'MARY ANN SMITH',
      currentName: 'MARY SMITH',
    })
    expect(profile.attitude.value).toBe(5)
  })

  it('bridge: |lifePath(3) - destinyMethodA_base(2)| = 1', () => {
    const profile = calculateFullProfile({
      birthDate: '1969-12-11',
      birthCertName: 'MARY ANN SMITH',
      currentName: 'MARY SMITH',
    })
    expect(profile.bridge.value).toBe(1)
  })

  it('includes motherName when provided', () => {
    const profile = calculateFullProfile({
      birthDate: '1969-12-11',
      birthCertName: 'MARY ANN SMITH',
      currentName: 'MARY SMITH',
      motherName: 'NGUYEN THI HOA',
    })
    expect(profile.motherName).toBeDefined()
    expect(profile.motherName?.value).toBe(3)
  })

  it('includes isolationNumbers array in profile', () => {
    const profile = calculateFullProfile({
      birthDate: '1983-03-03',
      birthCertName: 'MARY ANN SMITH',
      currentName: 'MARY SMITH',
    })
    expect(Array.isArray(profile.isolationNumbers)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Isolation Numbers (Số Cô Lập)
// A digit is isolated if: present in birth date AND appears only ONCE (not "strong")
// AND all 3×3 grid neighbours are absent.
// Digits appearing 2+ times are "strong" — excluded from isolation.
// Grid neighbours: 1→[2,4,5] 2→[1,3,4,5,6] 3→[2,5,6] 4→[1,2,5,7,8]
//                 5→[1,2,3,4,6,7,8,9] 6→[2,3,5,8,9] 7→[4,5,8] 8→[4,5,6,7,9] 9→[5,6,8]
// ---------------------------------------------------------------------------
describe('calculateIsolationNumbers', () => {
  it('1983-03-03 → [1] (3 appears 3× → strong; 1 isolated, 8 and 9 not isolated)', () => {
    // non-zero digits: 1,9,8,3,3,3 → counts: {1:1, 3:3, 8:1, 9:1}
    // 1: count=1, neighbours [2,4,5] — none present → isolated
    // 3: count=3 → STRONG → skip
    // 8: count=1, neighbours [4,5,6,7,9] — 9 present → not isolated
    // 9: count=1, neighbours [5,6,8] — 8 present → not isolated
    expect(calculateIsolationNumbers('1983-03-03')).toEqual([1])
  })

  it('1969-12-11 → [] (digits {1,2,6,9}: all have present neighbours or are strong)', () => {
    // non-zero: 1,9,6,9,1,2,1,1 → counts: {1:4, 9:2, 6:1, 2:1}
    // 1: count=4 → STRONG → skip (also neighbour 2 present)
    // 2: count=1, neighbours [1,3,4,5,6] — 1,6 present → not isolated
    // 6: count=1, neighbours [2,3,5,8,9] — 2,9 present → not isolated
    // 9: count=2 → STRONG → skip
    expect(calculateIsolationNumbers('1969-12-11')).toEqual([])
  })

  it('1111-01-01 → [] (digit 1 appears 5× → strong, not isolated)', () => {
    // non-zero: 1,1,1,1,1 → counts: {1:5} → STRONG → skip
    expect(calculateIsolationNumbers('1111-01-01')).toEqual([])
  })

  it('1971-11-10 → [7, 9] (1 appears 4× strong; 7 and 9 isolated)', () => {
    // non-zero: 1,9,7,1,1,1,1 → counts: {1:4, 9:1, 7:1}
    // 1: count=4 → STRONG → skip
    // 7: count=1, neighbours [4,5,8] — none present → isolated
    // 9: count=1, neighbours [5,6,8] — none present → isolated
    expect(calculateIsolationNumbers('1971-11-10')).toEqual([7, 9])
  })

  it('1984-04-13 → [3] (1 and 4 appear 2× strong; 8 and 9 have present neighbours)', () => {
    // non-zero: 1,9,8,4,4,1,3 → counts: {1:2, 9:1, 8:1, 4:2, 3:1}
    // 1: count=2 → STRONG → skip
    // 3: count=1, neighbours [2,5,6] — none present → isolated
    // 4: count=2 → STRONG → skip
    // 8: count=1, neighbours [4,5,6,7,9] — 4,9 present → not isolated
    // 9: count=1, neighbours [5,6,8] — 8 present → not isolated
    expect(calculateIsolationNumbers('1984-04-13')).toEqual([3])
  })

  it('digit absent from birth date is never isolated', () => {
    // 1990-03-09: digit 5 is absent, must not appear
    const result = calculateIsolationNumbers('1990-03-09')
    expect(result.includes(5)).toBe(false)
  })
})
