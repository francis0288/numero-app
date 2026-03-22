'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  locale: string
  clientId?: string
}

function OverviewIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'var(--color-mid)'
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'var(--color-mid)'
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  )
}

function ForecastIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'var(--color-mid)'
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="14" height="12" rx="2" />
      <path d="M2 8h14M6 2v4M12 2v4" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-gold)' : 'var(--color-mid)'
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4" />
    </svg>
  )
}

export function BottomNav({ locale, clientId }: BottomNavProps) {
  const pathname = usePathname()
  const base = locale === 'en' ? '' : `/${locale}`

  const items = [
    {
      label: 'Tổng Quan',
      href: clientId ? `${base}/clients/${clientId}/profile` : `${base}/dashboard`,
      icon: (a: boolean) => <OverviewIcon active={a} />,
      active: pathname.includes('/profile') || pathname.includes('/dashboard'),
    },
    {
      label: 'Hồ Sơ',
      href: clientId ? `${base}/clients/${clientId}/readings` : `${base}/dashboard`,
      icon: (a: boolean) => <ProfileIcon active={a} />,
      active: pathname.includes('/readings'),
    },
    {
      label: 'Dự Báo',
      href: clientId ? `${base}/clients/${clientId}/reading` : `${base}/dashboard`,
      icon: (a: boolean) => <ForecastIcon active={a} />,
      active: pathname.includes('/reading') && !pathname.includes('/readings'),
    },
    {
      label: 'Cài Đặt',
      href: `${base}/settings`,
      icon: (a: boolean) => <SettingsIcon active={a} />,
      active: pathname.includes('/settings'),
    },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--color-base)',
      borderTop: '0.5px solid rgba(28,26,20,0.10)',
      padding: '12px 8px 24px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            color: item.active ? 'var(--color-gold)' : 'var(--color-mid)',
            textDecoration: 'none',
            minWidth: 56,
          }}
        >
          {item.icon(item.active)}
          <span style={{
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-ui)',
            lineHeight: 1,
          }}>
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  )
}
