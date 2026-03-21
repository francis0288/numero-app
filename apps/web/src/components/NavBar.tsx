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
        <button
          onClick={toggleLocale}
          className={
            isVietnamese
              ? 'border border-[#E8E0F0] text-[#888888] rounded-full px-4 py-1.5 text-sm hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors'
              : 'bg-[#7B5EA7] text-white rounded-full px-4 py-1.5 text-sm transition-colors'
          }
        >
          {isVietnamese ? '🌐 ENG' : '🌐 TIẾNG VIỆT'}
        </button>
      </div>
    </nav>
  )
}
