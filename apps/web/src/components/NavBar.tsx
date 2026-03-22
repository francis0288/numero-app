'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from '@/navigation'

interface NavBarProps {
  locale: string
}

export function NavBar({ locale }: NavBarProps): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const isVietnamese = locale === 'vi'
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)
    setIsDark(saved !== 'light')
  }, [])

  const toggleLocale = () => {
    router.replace(pathname, { locale: isVietnamese ? 'en' : 'vi' })
  }

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setIsDark(!isDark)
  }

  return (
    <nav style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 20px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <a
        href={locale === 'en' ? '/dashboard' : `/${locale}/dashboard`}
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 17,
          fontWeight: 400,
          color: 'var(--text-primary)',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        NumeroApp
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
            color: 'var(--text-secondary)',
          }}
          title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {isDark ? '☀' : '☾'}
        </button>
        <a
          href={locale === 'en' ? '/settings' : `/${locale}/settings`}
          style={{
            color: 'var(--text-secondary)',
            fontSize: 18,
            lineHeight: 1,
            textDecoration: 'none',
          }}
          title="Cài đặt"
        >
          ⚙
        </a>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-subtle)' }} />
        <button
          onClick={toggleLocale}
          style={{
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
            borderRadius: 20,
            padding: '5px 14px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {isVietnamese ? 'ENG' : 'VIỆT'}
        </button>
      </div>
    </nav>
  )
}
