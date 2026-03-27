'use client'

import React, { useState } from 'react'
import { formatDateShortVI } from '@/lib/formatDate'

const AVATAR_COLORS = [
  { bg: 'var(--gold-bg)',    text: 'var(--gold-main)' },
  { bg: 'var(--purple-bg)',  text: 'var(--purple-bright)' },
  { bg: 'var(--gold-bg)',    text: 'var(--status-success)' },
  { bg: 'var(--amber-bg)',   text: 'var(--amber-main)' },
  { bg: 'var(--gold-bg)',    text: 'var(--text-muted)' },
]

const BADGE_COLORS = [
  { bg: 'var(--gold-bg)',    text: 'var(--gold-main)' },
  { bg: 'var(--purple-bg)',  text: 'var(--purple-bright)' },
  { bg: 'var(--gold-bg)',    text: 'var(--status-success)' },
  { bg: 'var(--amber-bg)',   text: 'var(--amber-main)' },
  { bg: 'var(--gold-bg)',    text: 'var(--text-muted)' },
]

interface EnrichedClient {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  dateOfBirth: Date | string
  preferredLanguage: string
  _count: { readings: number }
  lifePathDisplay: string
  destinyDisplay: string
  personalYearDisplay: string
  personalYearValue: number
  colorIndex: number
}

function getDisplayName(c: { firstName: string; middleName?: string | null; lastName?: string | null }) {
  return [c.lastName, c.middleName, c.firstName].filter(Boolean).join(' ')
}

function getInitials(c: { firstName: string; lastName?: string | null }) {
  const first = c.lastName?.[0] ?? c.firstName[0] ?? ''
  return first.toUpperCase()
}

type FilterKey = 'all' | 'recent'

export function ClientList({
  clients,
  locale,
  newClientPath,
}: {
  clients: EnrichedClient[]
  locale: string
  newClientPath: string
}): React.ReactElement {
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [clientList, setClientList] = useState<EnrichedClient[]>(clients)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const now = Date.now()
  const RECENT_MS = 30 * 24 * 60 * 60 * 1000

  const filtered = clientList.filter((c) => {
    const matchSearch = !search || getDisplayName(c).toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'recent' ? (now - new Date(c.dateOfBirth).getTime()) < RECENT_MS * 12 :
      true
    return matchSearch && matchFilter
  })

  const profilePath = (id: string) =>
    locale === 'en' ? `/clients/${id}/profile` : `/${locale}/clients/${id}/profile`

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

  const pillStyle = (active: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? 'none' : '0.5px solid var(--color-border)',
    backgroundColor: active ? 'var(--color-dark)' : 'var(--color-white)',
    color: active ? 'var(--color-base)' : 'var(--color-mid)',
    flexShrink: 0,
  } as React.CSSProperties)

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99, backgroundColor: 'var(--color-dark)', color: 'var(--color-base)',
          fontSize: 13, borderRadius: 12, padding: '10px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Search bar (expanded) */}
      {showSearch && (
        <div style={{ padding: '0 16px 12px' }}>
          <input
            autoFocus
            type="search"
            placeholder="Tìm kiếm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => { if (!search) setShowSearch(false) }}
            style={{
              width: '100%',
              border: '0.5px solid var(--color-border)',
              borderRadius: 12,
              padding: '10px 14px',
              backgroundColor: 'var(--color-white)',
              fontSize: 14,
              color: 'var(--color-dark)',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-ui)',
            }}
          />
        </div>
      )}

      {/* Filter pills */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '0 16px 14px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
        className="hide-scrollbar"
      >
        <button onClick={() => setFilter('all')} style={pillStyle(filter === 'all')}>Tất Cả</button>
        <button onClick={() => setFilter('recent')} style={pillStyle(filter === 'recent')}>Gần Đây</button>
      </div>

      {/* Empty state */}
      {clientList.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-dark)', margin: '0 0 6px' }}>Chưa có khách hàng</p>
          <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: '0 0 24px' }}>Thêm khách hàng đầu tiên để bắt đầu</p>
          <a
            href={newClientPath}
            style={{
              display: 'inline-block', backgroundColor: 'var(--color-gold)', color: 'white',
              borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 500, textDecoration: 'none',
            }}
          >
            + Thêm khách hàng mới
          </a>
        </div>
      )}

      {clientList.length > 0 && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-mid)', padding: '40px 16px', fontSize: 13 }}>
          Không tìm thấy &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Client cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
        {filtered.map((client) => {
          const av = AVATAR_COLORS[client.colorIndex]
          const bd = BADGE_COLORS[client.colorIndex]
          return (
            <div key={client.id}>
              {/* Delete confirm */}
              {pendingDelete === client.id && (
                <div style={{
                  backgroundColor: 'color-mix(in srgb, var(--status-error) 8%, transparent)', border: '1px solid var(--status-error)', borderRadius: 14,
                  padding: '12px 16px', marginBottom: 6, display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 12,
                }}>
                  <p style={{ fontSize: 13, color: 'var(--color-danger)', margin: 0, flex: 1 }}>
                    Xóa hồ sơ <strong>{getDisplayName(client)}</strong>? Thao tác này không thể hoàn tác.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setPendingDelete(null)}
                      style={{ border: '0.5px solid var(--color-border)', backgroundColor: 'white', color: 'var(--color-dark)', borderRadius: 10, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => void handleDelete(client.id)}
                      disabled={deleting === client.id}
                      style={{ backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: deleting === client.id ? 0.6 : 1 }}
                    >
                      {deleting === client.id ? '…' : 'Xóa'}
                    </button>
                  </div>
                </div>
              )}

              {/* Card */}
              <div style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 16,
                padding: 14,
                border: '0.5px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <a href={profilePath(client.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, textDecoration: 'none' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: av.bg, color: av.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 500,
                  }}>
                    {getInitials(client)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 500,
                        color: 'var(--color-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {getDisplayName(client)}
                      </span>
                      {/* Year badge */}
                      <span style={{
                        flexShrink: 0, fontSize: 9, fontWeight: 700,
                        backgroundColor: bd.bg, color: bd.text,
                        borderRadius: 10, padding: '3px 8px', letterSpacing: '0.02em',
                      }}>
                        Năm {client.personalYearDisplay}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: 0, fontFamily: 'var(--font-ui)' }}>
                      {formatDateShortVI(client.dateOfBirth)} · Đường Đời {client.lifePathDisplay} · Sứ Mệnh {client.destinyDisplay}
                    </p>
                  </div>

                  {/* Chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.preventDefault(); setPendingDelete(client.id) }}
                  style={{ color: 'var(--color-mid)', background: 'none', border: 'none', padding: 6, cursor: 'pointer', borderRadius: 8, flexShrink: 0 }}
                  title="Xóa hồ sơ"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
