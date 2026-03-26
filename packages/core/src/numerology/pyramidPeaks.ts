/**
 * Pyramid Peaks — David Phillips system
 * Source: "The Complete Book of Numerology" — David Phillips, Chapter 11
 *
 * KEY DIFFERENCES from Buchanan Pinnacles:
 * - Base numbers always reduced to single digit (no master numbers in base)
 * - Peak 3 & 4 may produce 10 or 11 — these are NOT reduced further
 * - Peak 1 & 2 always produce 1–9 only
 * - Ruling Number used for timing (= Life Path, already in DB)
 */

/** Reduce to single digit — NO master number exceptions */
function reduceStrict(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + Number(d), 0);
  }
  return n;
}

/** Reduce, but keep 10 and 11 (used for Peaks 3 and 4 only) */
function reducePeak34(n: number): number {
  if (n === 10 || n === 11) return n;
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + Number(d), 0);
    if (n === 10 || n === 11) return n;
  }
  return n;
}

export interface PyramidPeak {
  number: number;          // Peak number (1–9, or 10, 11)
  label: string;           // Display: "7", "10", "11"
  startAge: number;
  endAge: number | null;   // null = until end of life
  startYear: number;
  description: string;     // Short Vietnamese description label
}

export interface PyramidPeaksResult {
  peaks: PyramidPeak[];
  baseNumbers: { month: number; day: number; year: number };
}

const PEAK_DESCRIPTIONS: Record<number, string> = {
  1:  'Nỗ lực cá nhân, độc lập',
  2:  'Hợp tác, nhạy cảm, cân bằng',
  3:  'Sáng tạo, giao tiếp, niềm vui',
  4:  'Xây dựng nền tảng, kỷ luật',
  5:  'Thay đổi, tự do, trải nghiệm',
  6:  'Gia đình, trách nhiệm, yêu thương',
  7:  'Nội tâm, tâm linh, phát triển bản thân',
  8:  'Thành tựu, quyền lực, vật chất',
  9:  'Nhân đạo, hoàn thành, phục vụ',
  10: 'Sức mạnh đặc biệt, hướng dẫn người khác (10)',
  11: 'Trách nhiệm tâm linh cao, trực giác (11)',
};

/**
 * Calculate David Phillips Four Pyramid Peaks
 * @param birthDay   Day of birth (1–31)
 * @param birthMonth Month of birth (1–12)
 * @param birthYear  Full birth year (e.g. 1987)
 * @param lifePathNumber Ruling / Life Path number (1–9, or 11/22 reduced to 2/4 for timing)
 * @param currentYear Current calendar year
 */
export function calculatePyramidPeaks(
  birthDay: number,
  birthMonth: number,
  birthYear: number,
  lifePathNumber: number,   // pass the reduced value (e.g. 11→2, 22→4 for timing)
  currentYear: number
): PyramidPeaksResult {
  // Step 1: Reduce each base component to strict single digit
  const M = reduceStrict(birthMonth);
  const D = reduceStrict(birthDay);
  const Y = reduceStrict(
    String(birthYear).split('').reduce((a, d) => a + Number(d), 0)
  );

  // Step 2–5: Calculate four peak numbers
  const p1 = reduceStrict(M + D);          // Peak 1: month + day
  const p2 = reduceStrict(D + Y);          // Peak 2: day + year
  const p3 = reducePeak34(p1 + p2);        // Peak 3: P1 + P2 (keep 10, 11)
  const p4 = reducePeak34(M + Y);          // Peak 4: month + year (keep 10, 11)

  // Step 6: Calculate ages
  // Use the reduced ruling number for timing (22→4, 11→2)
  const rulingForTiming = lifePathNumber > 9 
    ? lifePathNumber % 9 || 9 
    : lifePathNumber;
  
  const age1 = 36 - rulingForTiming;       // Start of Peak 1 (= start of maturity)
  const age2 = age1 + 9;
  const age3 = age1 + 18;
  const age4 = age1 + 27;

  const year1 = birthYear + age1;
  const year2 = birthYear + age2;
  const year3 = birthYear + age3;
  const year4 = birthYear + age4;

  const fmt = (n: number) => n === 10 || n === 11 ? String(n) : String(n);

  const peaks: PyramidPeak[] = [
    {
      number: p1, label: fmt(p1),
      startAge: age1, endAge: age2 - 1,
      startYear: year1,
      description: PEAK_DESCRIPTIONS[p1] ?? '',
    },
    {
      number: p2, label: fmt(p2),
      startAge: age2, endAge: age3 - 1,
      startYear: year2,
      description: PEAK_DESCRIPTIONS[p2] ?? '',
    },
    {
      number: p3, label: fmt(p3),
      startAge: age3, endAge: age4 - 1,
      startYear: year3,
      description: PEAK_DESCRIPTIONS[p3] ?? '',
    },
    {
      number: p4, label: fmt(p4),
      startAge: age4, endAge: null,
      startYear: year4,
      description: PEAK_DESCRIPTIONS[p4] ?? '',
    },
  ];

  return {
    peaks,
    baseNumbers: { month: M, day: D, year: Y },
  };
}

/** Format peak age range for display */
export function formatPeakPeriod(peak: PyramidPeak): string {
  if (peak.endAge === null) {
    return `Từ ${peak.startAge} tuổi (${peak.startYear}+)`;
  }
  return `${peak.startAge}–${peak.endAge} tuổi (${peak.startYear})`;
}

/** Get the currently active peak for a given age */
export function getActivePeak(peaks: PyramidPeak[], currentAge: number): PyramidPeak | null {
  // Before maturity (before first peak age)
  if (currentAge < peaks[0].startAge) return null;
  
  for (let i = peaks.length - 1; i >= 0; i--) {
    if (currentAge >= peaks[i].startAge) return peaks[i];
  }
  return null;
}
