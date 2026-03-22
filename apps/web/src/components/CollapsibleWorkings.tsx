'use client'

import React, { useState } from 'react'

export function CollapsibleWorkings({ workings }: { workings: string }): React.ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: 10, borderTop: '0.5px solid var(--color-border)', paddingTop: 8 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          fontSize: 11,
          color: 'var(--color-mid)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 0,
          fontFamily: 'var(--font-ui)',
        }}
      >
        <span>{open ? '▲' : '▼'}</span>
        <span>Cách tính</span>
      </button>
      {open && (
        <pre style={{
          marginTop: 8,
          fontSize: 11,
          color: 'var(--color-mid)',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}>
          {workings}
        </pre>
      )}
    </div>
  )
}
