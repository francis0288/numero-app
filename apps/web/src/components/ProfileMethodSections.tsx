'use client'

import React, { useState, useCallback } from 'react'
import { TwoMethodCard } from './TwoMethodCard'

interface MethodData {
  value: number
  display: string
  isMasterNumber: boolean
  workings?: string
}

interface ProfileMethodSectionsProps {
  clientId: string
  destiny: { methodA: MethodData; methodB: MethodData }
  soul: { methodA: MethodData; methodB: MethodData }
  personality: { methodA: MethodData; methodB: MethodData }
  lifePath: MethodData
  maturity: MethodData
  birthDay: MethodData
  lifePathSub: string
  initialMethods: {
    destinyMethod: 'A' | 'B'
    soulMethod: 'A' | 'B'
    personalityMethod: 'A' | 'B'
  }
}

function WorkingsBlock({ workings }: { workings?: string }) {
  if (!workings) return null
  return (
    <div style={{
      marginTop: 6,
      borderLeft: '2px solid var(--color-gold)',
      backgroundColor: 'var(--gold-bg)',
      borderRadius: '0 6px 6px 0',
      padding: '6px 10px',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-gold)', margin: '0 0 2px', fontFamily: 'var(--font-ui)', letterSpacing: '0.04em' }}>
        Cách tính:
      </p>
      <pre style={{ fontSize: 11, color: 'var(--color-mid)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
        {workings}
      </pre>
    </div>
  )
}

export function ProfileMethodSections({
  clientId,
  destiny,
  soul,
  personality,
  lifePath,
  maturity,
  birthDay,
  lifePathSub,
  initialMethods,
}: ProfileMethodSectionsProps): React.ReactElement {
  const [methods, setMethods] = useState(initialMethods)
  const [toast, setToast] = useState('')

  const handleSelect = useCallback((field: string, method: 'A' | 'B') => {
    setMethods((prev) => ({ ...prev, [field]: method }))
    setToast('Đã lưu ✓')
    setTimeout(() => setToast(''), 1500)
  }, [])

  // Resolve selected values
  const selectedDestiny = methods.destinyMethod === 'B' ? destiny.methodB : destiny.methodA
  const selectedSoul = methods.soulMethod === 'B' ? soul.methodB : soul.methodA
  const selectedPersonality = methods.personalityMethod === 'B' ? personality.methodB : personality.methodA

  const methodLabel = (m: 'A' | 'B') => m === 'B' ? '(Cộng rút gọn)' : '(Cộng gộp ngang)'

  // Detail rows using selected methods
  const detailRows = [
    { num: lifePath.display, val: lifePath.value, isMaster: lifePath.isMasterNumber, title: 'Đường Đời', sub: lifePathSub, workings: lifePath.workings, methodNote: '' },
    { num: selectedDestiny.display, val: selectedDestiny.value, isMaster: selectedDestiny.isMasterNumber, title: 'Vận Mệnh', sub: 'Sứ mệnh tiềm ẩn trong tên khai sinh', workings: selectedDestiny.workings, methodNote: methodLabel(methods.destinyMethod) },
    { num: selectedSoul.display, val: selectedSoul.value, isMaster: selectedSoul.isMasterNumber, title: 'Linh Hồn', sub: 'Khao khát và động lực nội tâm', workings: selectedSoul.workings, methodNote: methodLabel(methods.soulMethod) },
    { num: selectedPersonality.display, val: selectedPersonality.value, isMaster: selectedPersonality.isMasterNumber, title: 'Nhân Cách', sub: 'Ấn tượng bên ngoài với thế giới', workings: selectedPersonality.workings, methodNote: methodLabel(methods.personalityMethod) },
    { num: maturity.display, val: maturity.value, isMaster: maturity.isMasterNumber, title: 'Trưởng Thành', sub: 'Tiềm năng cuối cuộc đời', workings: maturity.workings, methodNote: '' },
  ]

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99, backgroundColor: 'var(--color-dark)', color: 'var(--color-base)',
          fontSize: 13, borderRadius: 12, padding: '10px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Core numbers — progress rings (with selected values) ── */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{
          backgroundColor: 'var(--color-white)', borderRadius: 20,
          padding: '18px 10px 14px', border: '0.5px solid var(--color-border)',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            color: 'var(--color-gold)', textTransform: 'uppercase',
            margin: 0, fontFamily: 'var(--font-ui)', paddingLeft: 10, marginBottom: 16,
          }}>
            Số Cốt Lõi
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { nr: lifePath, label: 'Đường Đời' },
              { nr: selectedDestiny, label: 'Vận Mệnh' },
              { nr: selectedSoul, label: 'Linh Hồn' },
            ].map(({ nr, label }) => {
              const capped = Math.min(nr.value, 9)
              const dasharray = capped > 0 ? `${(capped / 9) * 175.9} 175.9` : '0 175.9'
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <svg viewBox="0 0 72 72" width="72" height="72">
                    <circle cx="36" cy="36" r="28" stroke="var(--gold-bg)" strokeWidth="5" fill="none" />
                    {capped > 0 && (
                      <circle
                        cx="36" cy="36" r="28"
                        stroke="var(--gold-main)" strokeWidth="5" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={dasharray}
                        transform="rotate(-90 36 36)"
                      />
                    )}
                    <text
                      x="36" y="41" textAnchor="middle"
                      fontSize={nr.isMasterNumber ? '14' : '20'} fontWeight="500"
                      fill="var(--text-primary)" fontFamily="Georgia,serif"
                    >
                      {nr.value > 0 ? nr.display : '—'}
                    </text>
                  </svg>
                  <span style={{ fontSize: 10, color: 'var(--color-mid)', letterSpacing: '0.04em', fontFamily: 'var(--font-ui)' }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Secondary numbers grid (with selected personality) ── */}
      <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { nr: selectedPersonality, label: 'Nhân Cách' },
          { nr: maturity, label: 'Trưởng Thành' },
          { nr: birthDay, label: 'Ngày Sinh' },
        ].map(({ nr, label }) => (
          <div key={label} style={{
            backgroundColor: 'var(--color-white)', borderRadius: 14,
            border: '0.5px solid var(--color-border)', padding: '12px 10px',
          }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 500, color: 'var(--color-dark)', margin: '0 0 4px' }}>
              {nr.display}
            </p>
            <p style={{ fontSize: 9, fontWeight: 400, color: 'var(--color-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontFamily: 'var(--font-ui)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Chi Tiết Số (with selected method values + workings) ── */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{
          backgroundColor: 'var(--color-white)', borderRadius: 16,
          border: '0.5px solid var(--color-border)', padding: '16px 16px 0',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            color: 'var(--color-gold)', textTransform: 'uppercase',
            margin: '0 0 12px', fontFamily: 'var(--font-ui)',
          }}>
            Chi Tiết Số
          </p>
          {detailRows.map(({ num, val, isMaster, title, sub, workings, methodNote }, idx) => (
            <div key={title} style={{
              padding: '14px 0',
              borderBottom: idx < detailRows.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: isMaster ? 26 : 36,
                  fontWeight: 400, color: 'var(--color-dark)',
                  minWidth: 44, lineHeight: 1, flexShrink: 0,
                }}>
                  {num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-dark)', margin: 0, fontFamily: 'var(--font-ui)' }}>
                      {title}
                    </p>
                    {methodNote && (
                      <span style={{ fontSize: 9, color: 'var(--color-gold)', fontFamily: 'var(--font-ui)' }}>
                        {methodNote}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '2px 0 8px', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
                    {sub}
                  </p>
                  <div style={{ height: 4, backgroundColor: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(Math.min(val, 9) / 9) * 100}%`,
                      backgroundColor: 'var(--gold-main)', borderRadius: 2,
                    }} />
                  </div>
                </div>
              </div>
              <WorkingsBlock workings={workings} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Two Method Cards ── */}
      <div style={{ padding: '0 16px 14px' }}>
        <TwoMethodCard
          title="Số Vận Mệnh"
          methodA={destiny.methodA}
          methodB={destiny.methodB}
          selected={methods.destinyMethod}
          clientId={clientId}
          fieldName="destinyMethod"
          onSelect={handleSelect}
        />
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <TwoMethodCard
          title="Số Linh Hồn"
          methodA={soul.methodA}
          methodB={soul.methodB}
          selected={methods.soulMethod}
          clientId={clientId}
          fieldName="soulMethod"
          onSelect={handleSelect}
        />
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <TwoMethodCard
          title="Số Nhân Cách"
          methodA={personality.methodA}
          methodB={personality.methodB}
          selected={methods.personalityMethod}
          clientId={clientId}
          fieldName="personalityMethod"
          onSelect={handleSelect}
        />
      </div>
    </>
  )
}
