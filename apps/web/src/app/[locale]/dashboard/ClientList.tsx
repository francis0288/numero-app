'use client'

import React, { useState } from 'react'

const LANG_LABELS: Record<string, string> = { en: 'EN', vi: 'Việt' }

interface Client {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  dateOfBirth: Date | string
  preferredLanguage: string
  _count: { readings: number }
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function initials(firstName: string) {
  return (firstName[0] ?? '').toUpperCase()
}

export function ClientList({
  clients,
  locale,
}: {
  clients: Client[]
  locale: string
}): React.ReactElement {
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return c.firstName.toLowerCase().includes(q)
  })

  const profilePath = (id: string) =>
    locale === 'en' ? `/clients/${id}/profile` : `/${locale}/clients/${id}/profile`

  const newClientPath = locale === 'en' ? '/clients/new' : `/${locale}/clients/new`

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="search"
          placeholder={locale === 'vi' ? 'Tìm kiếm khách hàng...' : 'Search clients…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#E8E0F0] rounded-xl pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-sm text-[#2C2C2C]"
        />
      </div>

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-lg font-medium text-[#2C2C2C] mb-1">{locale === 'vi' ? 'Chưa có khách hàng' : 'No clients yet'}</p>
          <p className="text-[#888888] text-sm mb-6">{locale === 'vi' ? 'Thêm khách hàng đầu tiên để bắt đầu' : 'Add your first client to get started'}</p>
          <a
            href={newClientPath}
            className="inline-block bg-[#7B5EA7] text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#6A4F96] transition-colors"
          >
            {locale === 'vi' ? '+ Thêm khách hàng mới' : '+ Add new client'}
          </a>
        </div>
      )}

      {/* Client list */}
      {clients.length > 0 && filtered.length === 0 && (
        <p className="text-center text-[#888888] py-12 text-sm">No clients match &ldquo;{search}&rdquo;</p>
      )}

      <div className="space-y-3">
        {filtered.map((client) => (
          <a
            key={client.id}
            href={profilePath(client.id)}
            className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-5 hover:shadow-md transition-shadow group"
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-[#F5F0FB] flex items-center justify-center text-[#7B5EA7] font-medium text-sm shrink-0">
              {initials(client.firstName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-[#2C2C2C]">
                  {client.firstName}
                </span>
                <span className="bg-[#F5F0FB] text-[#7B5EA7] text-xs rounded-full px-2 py-0.5 font-medium">
                  {LANG_LABELS[client.preferredLanguage] ?? client.preferredLanguage}
                </span>
              </div>
              <p className="text-sm text-[#888888]">{formatDate(client.dateOfBirth)}</p>
              <p className="text-xs text-[#888888] mt-0.5">
                {client._count.readings === 0
                  ? (locale === 'vi' ? 'Chưa có bài đọc' : 'No readings yet')
                  : locale === 'vi'
                    ? `${client._count.readings} bài đọc`
                    : `${client._count.readings} reading${client._count.readings !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Arrow */}
            <svg
              className="w-5 h-5 text-[#888888] group-hover:text-[#7B5EA7] transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>
    </>
  )
}
