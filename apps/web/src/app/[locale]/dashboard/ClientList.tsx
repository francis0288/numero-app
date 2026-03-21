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
  return new Date(d).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function initials(firstName: string) {
  return (firstName[0] ?? '').toUpperCase()
}

function TrashIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export function ClientList({
  clients,
  locale,
}: {
  clients: Client[]
  locale: string
}): React.ReactElement {
  const [search, setSearch] = useState('')
  const [clientList, setClientList] = useState<Client[]>(clients)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const filtered = clientList.filter((c) => {
    const q = search.toLowerCase()
    return c.firstName.toLowerCase().includes(q)
  })

  const profilePath = (id: string) =>
    locale === 'en' ? `/clients/${id}/profile` : `/${locale}/clients/${id}/profile`

  const newClientPath = locale === 'en' ? '/clients/new' : `/${locale}/clients/new`

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setClientList((prev) => prev.filter((c) => c.id !== id))
        setToast('Đã xóa hồ sơ')
        setTimeout(() => setToast(''), 3000)
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null)
      setPendingDelete(null)
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2C2C2C] text-white text-sm rounded-xl px-5 py-3 shadow-lg">
          ✓ {toast}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#E8E0F0] rounded-xl pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-sm text-[#2C2C2C]"
        />
      </div>

      {/* Empty state */}
      {clientList.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-lg font-medium text-[#2C2C2C] mb-1">Chưa có khách hàng</p>
          <p className="text-[#888888] text-sm mb-6">Thêm khách hàng đầu tiên để bắt đầu</p>
          <a
            href={newClientPath}
            className="inline-block bg-[#7B5EA7] text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#6A4F96] transition-colors"
          >
            + Thêm khách hàng mới
          </a>
        </div>
      )}

      {clientList.length > 0 && filtered.length === 0 && (
        <p className="text-center text-[#888888] py-12 text-sm">Không tìm thấy &ldquo;{search}&rdquo;</p>
      )}

      <div className="space-y-3">
        {filtered.map((client) => (
          <div key={client.id}>
            {/* Confirmation bar */}
            {pendingDelete === client.id && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-1 flex items-center justify-between gap-4">
                <p className="text-sm text-red-700">
                  Bạn có chắc muốn xóa hồ sơ của <strong>{client.firstName}</strong>? Tất cả bài đọc sẽ bị xóa vĩnh viễn.
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setPendingDelete(null)}
                    className="border border-[#E8E0F0] text-[#2C2C2C] rounded-lg px-3 py-1.5 text-sm hover:border-[#7B5EA7] transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => void handleDelete(client.id)}
                    disabled={deleting === client.id}
                    className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting === client.id ? 'Đang xóa…' : 'Xóa'}
                  </button>
                </div>
              </div>
            )}

            {/* Client card */}
            <div className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-5 hover:shadow-md transition-shadow group">
              <a href={profilePath(client.id)} className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-[#F5F0FB] flex items-center justify-center text-[#7B5EA7] font-medium text-sm shrink-0">
                  {initials(client.firstName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-[#2C2C2C]">{client.firstName}</span>
                    <span className="bg-[#F5F0FB] text-[#7B5EA7] text-xs rounded-full px-2 py-0.5 font-medium">
                      {LANG_LABELS[client.preferredLanguage] ?? client.preferredLanguage}
                    </span>
                  </div>
                  <p className="text-sm text-[#888888]">{formatDate(client.dateOfBirth)}</p>
                  <p className="text-xs text-[#888888] mt-0.5">
                    {client._count.readings === 0
                      ? 'Chưa có bài đọc'
                      : `${client._count.readings} bài đọc`}
                  </p>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-[#888888] group-hover:text-[#7B5EA7] transition-colors shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Delete button */}
              <button
                onClick={(e) => { e.preventDefault(); setPendingDelete(client.id) }}
                className="text-[#888888] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 shrink-0"
                title="Xóa hồ sơ"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
