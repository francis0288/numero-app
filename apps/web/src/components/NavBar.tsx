'use client'

import React from 'react'
import { usePathname, useRouter } from '@/navigation'

interface NavBarProps {
  locale: string
}

export function NavBar({ locale }: NavBarProps): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const isVietnamese = locale === 'vi'

  const toggleLocale = () => {
    router.replace(pathname, { locale: isVietnamese ? 'en' : 'vi' })
  }

  return (
    <nav style={{
      backgroundColor: 'var(--color-base)',
      borderBottom: '0.5px solid rgba(28,26,20,0.10)',
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
          color: 'var(--color-dark)',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        NumeroApp
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a
          href={locale === 'en' ? '/settings' : `/${locale}/settings`}
          style={{
            color: 'var(--color-mid)',
            fontSize: 18,
            lineHeight: 1,
            textDecoration: 'none',
          }}
          title="Cài đặt"
        >
          ⚙
        </a>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--color-border)' }} />
        <button
          onClick={toggleLocale}
          style={{
            border: `1px solid ${isVietnamese ? 'var(--color-border)' : 'var(--color-gold)'}`,
            color: isVietnamese ? 'var(--color-mid)' : 'var(--color-gold)',
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
