import React from 'react'
import { stripVietnamese, PYTHAGOREAN_MAP } from '@numero-app/core'

interface BirthChartGridProps {
  birthDay: number
  birthMonth: number
  birthYear: number
  firstName: string
  middleName: string
  lastName: string
  isolatedDigits: number[]
}

// Fixed grid layout — numbers never move
//   3 | 6 | 9   ← Hàng Tư Duy
//   2 | 5 | 8   ← Hàng Cảm Xúc
//   1 | 4 | 7   ← Hàng Hành Động
const GRID_ROWS: [number, number, number][] = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
]

const ROW_LABELS = ['TƯ DUY', 'CẢM XÚC', 'HÀNH ĐỘNG'] as const

// Adjacency for the Birth Chart grid (including diagonals)
const GRID_NEIGHBORS: Record<number, number[]> = {
  1: [2, 4, 5],
  2: [1, 3, 4, 5, 6],
  3: [2, 5, 6],
  4: [1, 2, 5, 7, 8],
  5: [1, 2, 3, 4, 6, 7, 8, 9],
  6: [2, 3, 5, 8, 9],
  7: [4, 5, 8],
  8: [4, 5, 6, 7, 9],
  9: [5, 6, 8],
}

const ANALYSIS_LINES = [
  { key: 'hangTuDuy',    label: 'Hàng Tư Duy',    digits: [3, 6, 9] as number[] },
  { key: 'hangCamXuc',   label: 'Hàng Cảm Xúc',   digits: [2, 5, 8] as number[] },
  { key: 'hangHanhDong', label: 'Hàng Hành Động',  digits: [1, 4, 7] as number[] },
  { key: 'cotThucTe',    label: 'Cột Thực Tế',     digits: [1, 4, 7] as number[] },
  { key: 'cotCamXuc',    label: 'Cột Cảm Xúc',     digits: [2, 5, 8] as number[] },
  { key: 'cotTriTue',    label: 'Cột Trí Tuệ',     digits: [3, 6, 9] as number[] },
  { key: 'cheoYChi',     label: 'Chéo Ý Chí',      digits: [1, 5, 9] as number[] },
  { key: 'cheoTamLinh',  label: 'Chéo Tâm Linh',   digits: [3, 5, 7] as number[] },
] as const

type LineKey = (typeof ANALYSIS_LINES)[number]['key']

const MEANINGS: Record<LineKey, { present: string; absent: string }> = {
  hangTuDuy:    { present: 'Tư duy sắc bén, trí nhớ tốt, khả năng diễn đạt cao',           absent: 'Cần phát triển tư duy logic và khả năng diễn đạt' },
  hangCamXuc:   { present: 'Cảm xúc cân bằng, nhạy cảm, có chiều sâu nội tâm',              absent: 'Cần phát triển sự cân bằng cảm xúc và linh hoạt' },
  hangHanhDong: { present: 'Nền tảng vững chắc, thực tế, hành động có mục tiêu',             absent: 'Cần phát triển tính thực tế và khả năng hành động' },
  cotThucTe:    { present: 'Sức khỏe, tài chính và sự kiên định được củng cố',               absent: 'Cần chú ý phát triển nền tảng vật chất và sức khỏe' },
  cotCamXuc:    { present: 'Cân bằng cảm xúc tốt, quan hệ hài hòa',                         absent: 'Cần phát triển sự cân bằng trong các mối quan hệ' },
  cotTriTue:    { present: 'Trí tuệ phát triển, khả năng giao tiếp và sáng tạo tốt',        absent: 'Cần phát triển tư duy sáng tạo và khả năng giao tiếp' },
  cheoYChi:     { present: 'Ý chí mạnh mẽ, quyết đoán, kiên trì theo đuổi mục tiêu',       absent: 'Cần rèn luyện ý chí và sự quyết đoán' },
  cheoTamLinh:  { present: 'Chiều sâu tâm linh, trực giác nhạy bén, định hướng rõ ràng',   absent: 'Cần phát triển chiều sâu tâm linh và trực giác' },
}

function computeDigitCounts(
  birthDay: number,
  birthMonth: number,
  birthYear: number,
  firstName: string,
  middleName: string,
  lastName: string,
): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }

  // Birth date digits — extract from day, month, year separately, remove zeros
  const birthRaw =
    String(birthDay).padStart(2, '0') +
    String(birthMonth).padStart(2, '0') +
    String(birthYear)
  for (const ch of birthRaw) {
    const d = parseInt(ch, 10)
    if (d >= 1 && d <= 9) counts[d]++
  }

  // Name digits — strip accents, map each letter via Pythagorean chart
  const stripped = [
    stripVietnamese(lastName),
    middleName ? stripVietnamese(middleName) : '',
    stripVietnamese(firstName),
  ].filter(Boolean).join(' ')

  for (const ch of stripped) {
    if (ch === ' ') continue
    const val = PYTHAGOREAN_MAP[ch.toUpperCase()]
    if (val && val >= 1 && val <= 9) counts[val]++
  }

  return counts
}

export function BirthChartGrid({
  birthDay,
  birthMonth,
  birthYear,
  firstName,
  middleName,
  lastName,
  isolatedDigits,
}: BirthChartGridProps) {
  const digitCounts = computeDigitCounts(
    birthDay, birthMonth, birthYear,
    firstName, middleName, lastName,
  )

  // Isolated cell: present in grid AND all neighbors are absent
  const isolatedFromGrid = new Set<number>()
  for (let digit = 1; digit <= 9; digit++) {
    if (digitCounts[digit] === 0) continue
    if (GRID_NEIGHBORS[digit].every(n => digitCounts[n] === 0)) {
      isolatedFromGrid.add(digit)
    }
  }
  // Also include any externally-computed isolated digits
  for (const d of isolatedDigits) isolatedFromGrid.add(d)

  const missingDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => digitCounts[d] === 0)

  return (
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 16,
        border: '0.5px solid var(--color-border)',
        padding: '16px',
      }}>
        {/* Section header */}
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--color-gold)', textTransform: 'uppercase',
          margin: '0 0 16px', fontFamily: 'var(--font-ui)',
        }}>
          BIỂU ĐỒ NGÀY SINH
        </p>

        {/* 3×3 Grid + row labels */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 64px)',
            gridTemplateRows: 'repeat(3, 64px)',
            gap: 4,
          }}>
            {GRID_ROWS.map((row) =>
              row.map((digit) => {
                const count = digitCounts[digit]
                const isEmpty = count === 0
                const isIsolated = isolatedFromGrid.has(digit)
                const content = isEmpty ? '' : String(digit).repeat(count)

                const fontSize =
                  content.length <= 2 ? 16 :
                  content.length === 3 ? 13 : 11

                return (
                  <div
                    key={digit}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      border: isIsolated
                        ? '1.5px solid #C4922A'
                        : isEmpty
                        ? '1px solid rgba(28,22,10,0.08)'
                        : '1px solid rgba(196,146,42,0.30)',
                      backgroundColor: isEmpty
                        ? 'rgba(28,22,10,0.03)'
                        : 'rgba(196,146,42,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isEmpty ? (
                      <span style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: 14,
                        color: 'rgba(28,22,10,0.15)',
                      }}>
                        {digit}
                      </span>
                    ) : (
                      <>
                        <span style={{
                          fontFamily: 'Georgia, serif',
                          fontSize,
                          fontWeight: 700,
                          color: isIsolated ? '#C4922A' : '#1C1A14',
                          lineHeight: 1,
                        }}>
                          {content}
                        </span>
                        {isIsolated && (
                          <span style={{
                            fontSize: 8,
                            color: '#C4922A',
                            marginTop: 2,
                            fontFamily: 'var(--font-ui)',
                          }}>
                            Cô Lập
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Row plane labels — right side */}
          <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(3, 64px)',
            gap: 4,
          }}>
            {ROW_LABELS.map((label) => (
              <div
                key={label}
                style={{
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 6,
                }}
              >
                <span style={{
                  fontSize: 9,
                  color: '#7A7568',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-ui)',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis section — 8 lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {ANALYSIS_LINES.map(({ key, label, digits }) => {
            const missing = digits.filter(d => digitCounts[d] === 0)
            const present = digits.filter(d => digitCounts[d] > 0)
            const allPresent = missing.length === 0
            const allMissing = present.length === 0

            let statusText: string
            if (allPresent)       statusText = '✓'
            else if (allMissing)  statusText = '✗'
            else                  statusText = `◐ Thiếu ${missing.join(', ')}`

            const accentColor = allPresent
              ? 'var(--color-green)'
              : allMissing
              ? 'var(--color-danger)'
              : 'var(--color-gold)'

            const meaning = allPresent
              ? MEANINGS[key].present
              : MEANINGS[key].absent

            return (
              <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-ui)',
                  color: accentColor,
                  flexShrink: 0,
                  width: 100,
                  lineHeight: 1.4,
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-ui)',
                  color: accentColor,
                  flexShrink: 0,
                  width: 72,
                  lineHeight: 1.4,
                }}>
                  {statusText}
                </span>
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--color-mid)',
                  lineHeight: 1.4,
                  flex: 1,
                }}>
                  {meaning}
                </span>
              </div>
            )
          })}
        </div>

        {/* Missing digits summary */}
        <div style={{
          borderLeft: `2px solid ${missingDigits.length > 0 ? 'var(--color-gold)' : 'rgba(28,22,10,0.08)'}`,
          backgroundColor: missingDigits.length > 0 ? 'var(--gold-bg)' : 'rgba(28,22,10,0.03)',
          borderRadius: '0 6px 6px 0',
          padding: '6px 10px',
        }}>
          {missingDigits.length > 0 ? (
            <p style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--color-gold)',
              margin: 0,
              fontFamily: 'var(--font-ui)',
            }}>
              Số thiếu: {missingDigits.join(', ')}
            </p>
          ) : (
            <p style={{
              fontSize: 12,
              color: 'var(--color-mid)',
              margin: 0,
              fontFamily: 'var(--font-ui)',
            }}>
              Không có số thiếu
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
