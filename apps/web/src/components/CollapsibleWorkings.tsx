'use client'

import React, { useState } from 'react'

export function CollapsibleWorkings({ workings }: { workings: string }): React.ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 border-t border-[#E8E0F0] pt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-xs text-[#888888] hover:text-[#7B5EA7] transition-colors flex items-center gap-1"
      >
        <span>{open ? '▲' : '▼'}</span>
        <span>Cách tính</span>
      </button>
      {open && (
        <pre className="mt-2 text-xs text-[#888888] font-mono whitespace-pre-wrap leading-relaxed">
          {workings}
        </pre>
      )}
    </div>
  )
}
