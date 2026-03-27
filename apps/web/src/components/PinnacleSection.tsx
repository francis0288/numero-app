'use client'

import React, { useState, useCallback } from 'react'

export interface BuchananPeakData {
  display: string        // "9", "11/2"
  startAge: number
  endAge: number         // 99 = last/open-ended
  startYear: number      // birthYear + startAge
  isCurrent: boolean
}

export interface PhillipsPeakData {
  number: number
  label: string          // "3", "10"
  startAge: number
  endAge: number | null
  startYear: number
  description: string
  isActive: boolean
}

interface PinnacleSectionProps {
  clientId: string
  buchananPeaks: BuchananPeakData[]
  phillipsPeaks: PhillipsPeakData[]
  phillipsBaseNumbers: { month: number; day: number; year: number }
  initialSystem: 'buchanan' | 'phillips'
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatBuchananPeriod(peak: BuchananPeakData): string {
  if (peak.endAge >= 99) return `${peak.startAge}t+ · ${peak.startYear}`
  return `${peak.startAge}–${peak.endAge - 1}t · ${peak.startYear}`
}

function formatPhillipsPeriod(peak: PhillipsPeakData): string {
  if (peak.endAge === null) return `${peak.startAge}t+ · ${peak.startYear}`
  return `${peak.startAge}–${peak.endAge}t · ${peak.startYear}`
}

// Strip "11/2" → "11" for tight circles
function shortDisplay(s: string): string {
  return s.includes('/') ? s.split('/')[0] : s
}

// ─── Pyramid diagram ────────────────────────────────────────────────────────

const GOLD = '#C4922A'
const CIRCLE_R = 14

// viewBox "0 0 165 130"
// Index 0 = Đỉnh 1 (bottom-left), 1 = Đỉnh 2 (bottom-right),
//       2 = Đỉnh 3 (top-center),  3 = Đỉnh 4 (far-right)
const PEAK_POS = [
  { cx: 22,  cy: 100 },
  { cx: 103, cy: 100 },
  { cx: 78,  cy: 16  },
  { cx: 150, cy: 56  },
] as const

const PYRAMID_LINES: [number, number][] = [
  [0, 2],  // Đỉnh 1 → Đỉnh 3
  [2, 1],  // Đỉnh 3 → Đỉnh 2
  [0, 1],  // Đỉnh 1 → Đỉnh 2 (base)
  [1, 3],  // Đỉnh 2 → Đỉnh 4
  [2, 3],  // Đỉnh 3 → Đỉnh 4
]

function PeakPyramidSVG({
  peaks,
}: {
  peaks: { display: string; isActive: boolean }[]
}) {
  return (
    <svg
      viewBox="0 0 165 130"
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
    >
      {/* Dashed connecting lines */}
      {PYRAMID_LINES.map(([from, to], i) => {
        const p1 = PEAK_POS[from]
        const p2 = PEAK_POS[to]
        return (
          <line
            key={i}
            x1={p1.cx} y1={p1.cy}
            x2={p2.cx} y2={p2.cy}
            stroke="rgba(196,146,42,0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )
      })}

      {/* Peak circles + labels */}
      {peaks.map((peak, i) => {
        const pos = PEAK_POS[i]
        if (!pos) return null
        const { cx, cy } = pos
        const label = shortDisplay(peak.display)
        const numFontSize = label.length >= 2 ? 11 : 13

        return (
          <g key={i}>
            {/* Circle */}
            <circle
              cx={cx} cy={cy} r={CIRCLE_R}
              fill={peak.isActive ? GOLD : 'transparent'}
              stroke={GOLD}
              strokeWidth={1.5}
            />
            {/* Number */}
            <text
              x={cx} y={cy + 4.5}
              textAnchor="middle"
              fontSize={numFontSize}
              fontWeight="700"
              fontFamily="Georgia, serif"
              style={{ fill: peak.isActive ? 'white' : GOLD }}
            >
              {label}
            </text>
            {/* "Đỉnh N" label below circle */}
            <text
              x={cx} y={cy + CIRCLE_R + 10}
              textAnchor="middle"
              fontSize={7}
              style={{ fill: 'var(--color-mid)' }}
            >
              Đỉnh {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Summary card row (2×2 below pyramid) ──────────────────────────────────

function SummaryCard({
  label,
  display,
  period,
  description,
  isActive,
  fontUi,
}: {
  label: string
  display: string
  period: string
  description?: string
  isActive: boolean
  fontUi: string
}) {
  const borderColor = isActive
    ? GOLD
    : 'color-mix(in srgb, var(--color-dark) 8%, transparent)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 5px', borderRadius: 8,
      border: `${isActive ? 1.5 : 1}px solid ${borderColor}`,
      backgroundColor: isActive ? 'rgba(196,146,42,0.05)' : 'transparent',
    }}>
      {/* Small circle */}
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        backgroundColor: isActive ? GOLD : 'transparent',
        border: `1.5px solid ${GOLD}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Georgia, serif',
          fontSize: shortDisplay(display).length >= 2 ? 9 : 11,
          fontWeight: 700, lineHeight: 1,
          color: isActive ? 'white' : GOLD,
        }}>
          {shortDisplay(display)}
        </span>
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: 7, fontWeight: 700, margin: 0,
          color: isActive ? 'var(--color-gold)' : 'var(--color-mid)',
          fontFamily: fontUi, textTransform: 'uppercase',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 7, margin: '1px 0 0',
          color: 'var(--color-mid)', fontFamily: fontUi, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {period}
        </p>
        {description && (
          <p style={{
            fontSize: 6, margin: '1px 0 0',
            color: 'var(--color-mid)', fontFamily: fontUi, lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            opacity: 0.8,
          }}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function PinnacleSection({
  clientId,
  buchananPeaks,
  phillipsPeaks,
  phillipsBaseNumbers,
  initialSystem,
}: PinnacleSectionProps): React.ReactElement {
  const [system, setSystem] = useState<'buchanan' | 'phillips'>(initialSystem)
  const [saving, setSaving] = useState(false)

  const handleSelect = useCallback(async (s: 'buchanan' | 'phillips') => {
    if (s === system) return
    setSystem(s)
    setSaving(true)
    try {
      await fetch(`/api/clients/${clientId}/methods`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinnacleSystem: s }),
      })
    } finally {
      setSaving(false)
    }
  }, [system, clientId])

  const goldColor = 'var(--color-gold)'
  const midColor = 'var(--color-mid)'
  const borderSubtle = 'var(--color-border)'
  const white = 'var(--color-white)'
  const fontUi = 'var(--font-ui)'

  const buchananPyramidPeaks = buchananPeaks.map(p => ({
    display: p.display,
    isActive: p.isCurrent,
  }))

  const phillipsPyramidPeaks = phillipsPeaks.map(p => ({
    display: p.label,
    isActive: p.isActive,
  }))

  const inactivePanelBorder = 'rgba(28,22,10,0.10)'

  return (
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{
        backgroundColor: white, borderRadius: 16,
        border: `0.5px solid ${borderSubtle}`, padding: 16,
      }}>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              color: goldColor, textTransform: 'uppercase',
              margin: 0, fontFamily: fontUi,
            }}>
              Số Đỉnh
            </p>
            <p style={{
              fontSize: 9, color: midColor, margin: '2px 0 0', fontFamily: fontUi,
              opacity: saving ? 0.5 : 1,
            }}>
              {saving ? 'Đang lưu…' : '· Đang dùng cho bài đọc AI'}
            </p>
          </div>

          {/* Selector pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['buchanan', 'phillips'] as const).map((s) => {
              const isActive = system === s
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  style={{
                    fontSize: 10, fontWeight: isActive ? 700 : 400,
                    fontFamily: fontUi, cursor: 'pointer',
                    padding: '4px 10px', borderRadius: 20,
                    backgroundColor: isActive ? goldColor : 'transparent',
                    color: isActive ? 'var(--bg-card)' : goldColor,
                    border: isActive ? 'none' : `1px solid ${goldColor}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {s === 'buchanan' ? 'Buchanan' : 'Phillips'}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Two-column panels ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Buchanan panel */}
          <div style={{
            borderRadius: 14, padding: '10px 8px 8px',
            backgroundColor: white,
            border: `1.5px solid ${system === 'buchanan' ? goldColor : inactivePanelBorder}`,
          }}>
            <p style={{
              fontSize: 9, fontWeight: system === 'buchanan' ? 700 : 400,
              color: system === 'buchanan' ? goldColor : midColor,
              margin: '0 0 6px', fontFamily: fontUi,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Buchanan
            </p>

            <PeakPyramidSVG peaks={buchananPyramidPeaks} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              {buchananPeaks.map((peak, idx) => (
                <SummaryCard
                  key={idx}
                  label={`Đỉnh ${idx + 1}`}
                  display={peak.display}
                  period={formatBuchananPeriod(peak)}
                  isActive={peak.isCurrent}
                  fontUi={fontUi}
                />
              ))}
            </div>
          </div>

          {/* Phillips panel */}
          <div style={{
            borderRadius: 14, padding: '10px 8px 8px',
            backgroundColor: white,
            border: `1.5px solid ${system === 'phillips' ? goldColor : inactivePanelBorder}`,
          }}>
            <p style={{
              fontSize: 9, fontWeight: system === 'phillips' ? 700 : 400,
              color: system === 'phillips' ? goldColor : midColor,
              margin: '0 0 1px', fontFamily: fontUi,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              David Phillips
            </p>
            <p style={{ fontSize: 7, color: midColor, margin: '0 0 4px', fontFamily: fontUi }}>
              Cơ số: T{phillipsBaseNumbers.month}·N{phillipsBaseNumbers.day}·{phillipsBaseNumbers.year}
            </p>

            <PeakPyramidSVG peaks={phillipsPyramidPeaks} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              {phillipsPeaks.map((peak, idx) => (
                <SummaryCard
                  key={idx}
                  label={`Đỉnh ${idx + 1}`}
                  display={peak.label}
                  period={formatPhillipsPeriod(peak)}
                  description={peak.description}
                  isActive={peak.isActive}
                  fontUi={fontUi}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
