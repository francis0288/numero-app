'use client'

import React from 'react'
import { usePathname, useRouter } from '@/navigation'

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  zh: '中文',
  vi: 'Việt',
}

interface NavBarProps {
  locale: string
}

export function NavBar({ locale }: NavBarProps): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-[#E8E0F0] px-6 py-3 flex items-center justify-between">
      <a
        href={locale === 'en' ? '/dashboard' : `/${locale}/dashboard`}
        className="text-[#7B5EA7] font-medium text-lg tracking-tight"
      >
        NumeroApp
      </a>

      <div className="flex items-center gap-3">
        <a
          href={locale === 'en' ? '/settings' : `/${locale}/settings`}
          className="text-[#888888] hover:text-[#7B5EA7] transition-colors text-lg leading-none"
          title="Settings"
        >
          ⚙
        </a>
        <div className="w-px h-4 bg-[#E8E0F0]" />
        <div className="flex items-center gap-1">
          {(['en', 'zh', 'vi'] as const).map((l) => (
            <button
              key={l}
              onClick={() => router.replace(pathname, { locale: l })}
              className={
                l === locale
                  ? 'bg-[#7B5EA7] text-white rounded-full px-3 py-1 text-sm font-medium transition-colors'
                  : 'text-[#888888] hover:text-[#7B5EA7] px-3 py-1 text-sm transition-colors'
              }
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
