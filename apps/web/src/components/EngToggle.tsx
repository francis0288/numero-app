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
          ? 'bg-[#E8E0F0] text-[#7B5EA7] border-[#7B5EA7]'
          : 'border-[#E8E0F0] text-[#888888] hover:border-[#7B5EA7] hover:text-[#7B5EA7]'
      }`}
    >
      {active ? 'ENG ✓' : 'ENG'}
    </button>
  )
}
