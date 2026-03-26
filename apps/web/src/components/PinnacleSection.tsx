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

function formatBuchananPeriod(peak: BuchananPeakData): string {
  if (peak.endAge >= 99) return `${peak.startAge}t+ · ${peak.startYear}`
  return `${peak.startAge}–${peak.endAge - 1}t · ${peak.startYear}`
}

function formatPhillipsPeriod(peak: PhillipsPeakData): string {
  if (peak.endAge === null) return `${peak.startAge}t+ · ${peak.startYear}`
  return `${peak.startAge}–${peak.endAge}t · ${peak.startYear}`
}

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
    setSystem(s)           // optimistic
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
  const darkColor = 'var(--color-dark)'
  const midColor = 'var(--color-mid)'
  const borderSubtle = 'var(--color-border)'
  const white = 'var(--color-white)'
  const fontUi = 'var(--font-ui)'

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
            {!saving && (
              <p style={{ fontSize: 9, color: midColor, margin: '2px 0 0', fontFamily: fontUi }}>
                · Đang dùng cho bài đọc AI
              </p>
            )}
            {saving && (
              <p style={{ fontSize: 9, color: midColor, margin: '2px 0 0', fontFamily: fontUi, opacity: 0.6 }}>
                Đang lưu…
              </p>
            )}
          </div>

          {/* System selector pills */}
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
            borderRadius: 14, padding: 12,
            backgroundColor: white,
            border: `1.5px solid ${system === 'buchanan' ? goldColor : 'rgba(28,22,10,0.10)'}`,
          }}>
            <p style={{
              fontSize: 10, fontWeight: system === 'buchanan' ? 700 : 400,
              color: system === 'buchanan' ? goldColor : midColor,
              margin: '0 0 10px', fontFamily: fontUi,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Buchanan
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {buchananPeaks.map((peak, idx) => (
                <div key={idx} style={{
                  borderRadius: 10, padding: 8,
                  backgroundColor: peak.isCurrent ? `rgba(196,146,42,0.06)` : 'transparent',
                  border: `${peak.isCurrent ? 1.5 : 1}px solid ${peak.isCurrent ? goldColor : 'rgba(28,22,10,0.08)'}`,
                }}>
                  <p style={{
                    fontSize: 8, fontWeight: 700, margin: '0 0 3px',
                    color: peak.isCurrent ? goldColor : midColor,
                    textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: fontUi,
                  }}>
                    Đỉnh {idx + 1}
                  </p>
                  <p style={{
                    fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700,
                    lineHeight: 1, margin: '0 0 3px',
                    color: peak.isCurrent ? goldColor : darkColor,
                  }}>
                    {peak.display}
                  </p>
                  <p style={{ fontSize: 8, color: midColor, margin: 0, fontFamily: fontUi, lineHeight: 1.3 }}>
                    {formatBuchananPeriod(peak)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Phillips panel */}
          <div style={{
            borderRadius: 14, padding: 12,
            backgroundColor: white,
            border: `1.5px solid ${system === 'phillips' ? goldColor : 'rgba(28,22,10,0.10)'}`,
          }}>
            <p style={{
              fontSize: 10, fontWeight: system === 'phillips' ? 700 : 400,
              color: system === 'phillips' ? goldColor : midColor,
              margin: '0 0 4px', fontFamily: fontUi,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              David Phillips
            </p>
            <p style={{ fontSize: 8, color: midColor, margin: '0 0 8px', fontFamily: fontUi }}>
              Cơ số: T{phillipsBaseNumbers.month}·N{phillipsBaseNumbers.day}·{phillipsBaseNumbers.year}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {phillipsPeaks.map((peak, idx) => {
                const isSpecial = peak.number === 10 || peak.number === 11
                return (
                  <div key={idx} style={{
                    borderRadius: 10, padding: 8,
                    backgroundColor: peak.isActive ? `rgba(196,146,42,0.06)` : 'transparent',
                    border: `${peak.isActive ? 1.5 : 1}px solid ${peak.isActive ? goldColor : 'rgba(28,22,10,0.08)'}`,
                  }}>
                    <p style={{
                      fontSize: 8, fontWeight: 700, margin: '0 0 3px',
                      color: peak.isActive ? goldColor : midColor,
                      textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: fontUi,
                    }}>
                      Đỉnh {idx + 1}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <p style={{
                        fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700,
                        lineHeight: 1, margin: '0 0 3px',
                        color: peak.isActive ? goldColor : darkColor,
                      }}>
                        {peak.label}
                      </p>
                      {isSpecial && (
                        <span style={{ fontSize: 8, color: goldColor, fontFamily: fontUi, opacity: 0.8, fontWeight: 700 }}>
                          ★
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 8, color: midColor, margin: 0, fontFamily: fontUi, lineHeight: 1.3 }}>
                      {formatPhillipsPeriod(peak)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
