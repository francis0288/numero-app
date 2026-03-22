'use client'

import React, { useState } from 'react'

export function EngToggle(): React.ReactElement {
  const [active, setActive] = useState(false)
  const toggle = () => {
    setActive(a => !a)
    document.body.classList.toggle('show-eng')
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className={`text-xs rounded-full px-3 py-1 border transition-colors ${
        active
          ? 'bg-[var(--border-subtle)] text-[var(--purple-main)] border-[var(--purple-main)]'
          : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--purple-main)] hover:text-[var(--purple-main)]'
      }`}
    >
      {active ? 'ENG ✓' : 'ENG'}
    </button>
  )
}
