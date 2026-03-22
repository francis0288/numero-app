'use client'

import React, { useState } from 'react'

interface MethodData {
  value: number
  display: string
  isMasterNumber: boolean
  workings?: string
}

// eslint-disable-next-line no-unused-vars
type OnSelectFn = (field: string, method: 'A' | 'B') => void

interface TwoMethodCardProps {
  title: string
  methodA: MethodData
  methodB: MethodData
  selected: 'A' | 'B'
  clientId: string
  fieldName: 'destinyMethod' | 'soulMethod' | 'personalityMethod'
  onSelect: OnSelectFn
}

export function TwoMethodCard({
  title,
  methodA,
  methodB,
  selected,
  clientId,
  fieldName,
  onSelect,
}: TwoMethodCardProps): React.ReactElement {
  const [saving, setSaving] = useState(false)

  const handleSelect = async (method: 'A' | 'B') => {
    if (method === selected) return
    onSelect(fieldName, method)
    setSaving(true)
    try {
      await fetch(`/api/clients/${clientId}/methods`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: method }),
      })
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#1C1A14', borderRadius: 16,
      padding: '16px', border: '1px solid rgba(196,146,42,0.15)',
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        color: '#C4922A', textTransform: 'uppercase',
        margin: '0 0 4px', fontFamily: 'var(--font-ui)',
      }}>
        {title} — Hai Phương Pháp
      </p>
      <p style={{ fontSize: 10, color: 'rgba(250,248,243,0.4)', margin: '0 0 12px', fontFamily: 'var(--font-ui)' }}>
        Chọn phương pháp tính:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Method A */}
        <button
          type="button"
          onClick={() => void handleSelect('A')}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            textAlign: 'left', position: 'relative',
          }}
        >
          <div style={{
            backgroundColor: selected === 'A' ? 'rgba(196,146,42,0.12)' : 'rgba(250,248,243,0.06)',
            borderRadius: 12, padding: '12px',
            border: selected === 'A' ? '1.5px solid #C4922A' : '1px solid rgba(250,248,243,0.1)',
            opacity: selected === 'A' ? 1 : 0.6,
            transition: 'all 0.2s',
          }}>
            {selected === 'A' && (
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 20, height: 20, borderRadius: '50%',
                backgroundColor: '#C4922A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'white', fontWeight: 700,
              }}>
                ✓
              </div>
            )}
            <p style={{ fontSize: 9, color: 'rgba(250,248,243,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
              Cộng gộp ngang
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, color: 'white', margin: '0 0 4px', lineHeight: 1 }}>
              {methodA.display}
            </p>
            {methodA.isMasterNumber && (
              <span style={{ fontSize: 9, color: '#E8C97A', fontFamily: 'var(--font-ui)' }}>Số chủ</span>
            )}
            {methodA.workings && (
              <pre style={{ fontSize: 9, color: 'rgba(250,248,243,0.4)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.4, margin: '6px 0 0' }}>
                {methodA.workings}
              </pre>
            )}
          </div>
        </button>

        {/* Method B */}
        <button
          type="button"
          onClick={() => void handleSelect('B')}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            textAlign: 'left', position: 'relative',
          }}
        >
          <div style={{
            backgroundColor: selected === 'B' ? 'rgba(196,146,42,0.12)' : 'rgba(250,248,243,0.06)',
            borderRadius: 12, padding: '12px',
            border: selected === 'B' ? '1.5px solid #C4922A' : '1px solid rgba(250,248,243,0.1)',
            opacity: selected === 'B' ? 1 : 0.6,
            transition: 'all 0.2s',
          }}>
            {selected === 'B' && (
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 20, height: 20, borderRadius: '50%',
                backgroundColor: '#C4922A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'white', fontWeight: 700,
              }}>
                ✓
              </div>
            )}
            <p style={{ fontSize: 9, color: 'rgba(250,248,243,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
              Cộng rút gọn
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, color: 'white', margin: '0 0 4px', lineHeight: 1 }}>
              {methodB.display}
            </p>
            {methodB.isMasterNumber && (
              <span style={{ fontSize: 9, color: '#E8C97A', fontFamily: 'var(--font-ui)' }}>Số chủ</span>
            )}
            {methodB.workings && (
              <pre style={{ fontSize: 9, color: 'rgba(250,248,243,0.4)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.4, margin: '6px 0 0' }}>
                {methodB.workings}
              </pre>
            )}
          </div>
        </button>
      </div>

      {methodA.value !== methodB.value && (
        <p style={{ fontSize: 10, color: 'rgba(250,248,243,0.4)', margin: '10px 0 0', fontFamily: 'var(--font-ui)', lineHeight: 1.4 }}>
          ℹ Hai phương pháp có thể cho kết quả khác nhau — cả hai đều đúng theo hệ thống Pythagore.
        </p>
      )}

      <p style={{ fontSize: 9, color: 'rgba(250,248,243,0.3)', margin: '8px 0 0', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>
        {saving ? 'Đang lưu…' : 'Lựa chọn được lưu tự động'}
      </p>
    </div>
  )
}
