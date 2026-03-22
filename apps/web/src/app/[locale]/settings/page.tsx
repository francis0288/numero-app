'use client'

import React, { useState, useRef } from 'react'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { useParams } from 'next/navigation'

function SectionLabel({ title }: { title: string }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
      color: 'var(--color-gold)', textTransform: 'uppercase' as const,
      margin: '0 0 8px', padding: '0 4px', fontFamily: 'var(--font-ui)',
    }}>
      {title}
    </p>
  )
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: '0.5px solid var(--color-border)',
      backgroundColor: 'var(--color-white)',
      marginBottom: 28,
    }}>
      {children}
    </div>
  )
}

function SettingsRow({
  icon, label, right, first = false, danger = false,
}: {
  icon: React.ReactNode
  label: string
  right?: React.ReactNode
  first?: boolean
  danger?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px',
      borderTop: first ? 'none' : '0.5px solid rgba(28,22,10,0.07)',
    }}>
      <div style={{ color: danger ? 'var(--color-danger)' : 'var(--color-mid)', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{
        flex: 1, fontSize: 14, color: danger ? 'var(--color-danger)' : 'var(--color-dark)',
        fontFamily: 'var(--font-ui)',
      }}>
        {label}
      </span>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  )
}

function ChevronRight({ danger = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={danger ? 'var(--color-danger)' : 'var(--color-mid)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: danger ? 1 : 0.5 }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// eslint-disable-next-line no-unused-vars
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        backgroundColor: value ? 'var(--color-gold)' : 'rgba(28,22,10,0.12)',
        position: 'relative', transition: 'background 0.2s',
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', backgroundColor: 'white',
        transition: 'left 0.2s', display: 'block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const params = useParams()
  const locale = (params.locale as string) ?? 'en'

  const [name, setName] = useState('')
  const [brandingFooter, setBrandingFooter] = useState('')
  const [phone, setPhone] = useState('')
  const [brandingEmail, setBrandingEmail] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSaved, setLogoSaved] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [apiKey, setApiKey] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [apiKeyError, setApiKeyError] = useState('')

  const [masterNumbers, setMasterNumbers] = useState(true)
  const [showMethodNotes, setShowMethodNotes] = useState(false)

  React.useEffect(() => {
    fetch('/api/settings/profile')
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json() as { name?: string; email?: string; logoUrl?: string; brandingFooter?: string; phone?: string; brandingEmail?: string }
          setName(d.name ?? '')
          setBrandingFooter(d.brandingFooter ?? '')
          setPhone(d.phone ?? '')
          setBrandingEmail(d.brandingEmail ?? '')
          if (d.logoUrl) setLogoPreview(d.logoUrl)
        }
      })
      .catch(() => {})
  }, [])

  const saveProfile = async () => {
    const res = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, brandingFooter, phone, brandingEmail }),
    })
    if (res.ok) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setLogoPreview(dataUrl)
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: dataUrl }),
      })
      if (res.ok) {
        setLogoSaved(true)
        setTimeout(() => setLogoSaved(false), 2000)
      }
    }
    reader.readAsDataURL(file)
  }

  const saveApiKey = async () => {
    setApiKeyError('')
    const res = await fetch('/api/settings/apikey', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })
    if (res.ok) {
      setApiKeySaved(true)
      setApiKey('')
      setTimeout(() => setApiKeySaved(false), 2000)
    } else {
      const d = await res.json() as { error?: string }
      setApiKeyError(d.error ?? 'Không thể lưu khóa')
    }
  }

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* Practitioner avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: 'var(--color-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 500, color: 'white',
              }}>
                {initials}
              </div>
            )}
            <button
              onClick={() => logoInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: 'var(--color-dark)', border: '2px solid var(--color-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white', fontSize: 12,
              }}
            >
              {logoSaved ? '✓' : '✎'}
            </button>
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-dark)', margin: 0, fontFamily: 'Georgia, serif' }}>
            {name || 'Tên nhà tư vấn'}
          </p>
          <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoSelect} />
        </div>

        {/* Profile group */}
        <SectionLabel title="Hồ Sơ Nhà Tư Vấn" />
        <SettingsGroup>
          {[
            { field: 'name', label: 'Tên', value: name, setter: setName, placeholder: 'Tên hiển thị' },
            { field: 'phone', label: 'Số điện thoại', value: phone, setter: setPhone, placeholder: '0901 234 567' },
            { field: 'email', label: 'Email liên hệ', value: brandingEmail, setter: setBrandingEmail, placeholder: 'hello@yoursite.com' },
            { field: 'footer', label: 'Chân trang thương hiệu', value: brandingFooter, setter: setBrandingFooter, placeholder: 'yoursite.com' },
          ].map(({ field, label, value, setter, placeholder }, i) => (
            <div key={field} style={{
              borderTop: i === 0 ? 'none' : '0.5px solid rgba(28,22,10,0.07)',
              padding: '12px 16px',
            }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--color-mid)', marginBottom: 4, fontWeight: 500 }}>{label}</label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%', border: 'none', background: 'none', outline: 'none',
                  fontSize: 14, color: 'var(--color-dark)', fontFamily: 'var(--font-ui)',
                  padding: 0, boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
          <div style={{ borderTop: '0.5px solid rgba(28,22,10,0.07)', padding: '12px 16px' }}>
            <button
              type="button"
              onClick={() => void saveProfile()}
              style={{
                backgroundColor: 'var(--color-gold)', color: 'white',
                border: 'none', borderRadius: 10, padding: '9px 20px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)',
              }}
            >
              {profileSaved ? '✓ Đã lưu' : 'Lưu thay đổi'}
            </button>
          </div>
        </SettingsGroup>

        {/* AI integration */}
        <SectionLabel title="Tích Hợp AI" />
        <div style={{
          borderRadius: 14, border: '0.5px solid var(--color-border)',
          backgroundColor: 'var(--color-white)', marginBottom: 28, padding: 16,
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-mid)', margin: '0 0 10px', fontWeight: 500 }}>Khóa API Anthropic</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{
              width: '100%', border: '0.5px solid var(--color-border)', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, color: 'var(--color-dark)', outline: 'none',
              backgroundColor: 'var(--color-base)', boxSizing: 'border-box', fontFamily: 'var(--font-ui)',
            }}
          />
          {apiKeyError && <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: '6px 0 0' }}>{apiKeyError}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => void saveApiKey()}
              style={{
                backgroundColor: 'var(--color-gold)', color: 'white', border: 'none',
                borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-ui)',
              }}
            >
              {apiKeySaved ? '✓ Đã lưu' : 'Cập Nhật Khóa'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--color-mid)', margin: 0 }}>
              Lấy khóa tại{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--color-gold)' }}>
                console.anthropic.com
              </a>
            </p>
          </div>
        </div>

        {/* Preferences */}
        <SectionLabel title="Tuỳ Chỉnh" />
        <SettingsGroup>
          <SettingsRow
            first
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none" fontWeight="700">M</text></svg>}
            label="Giữ Số Bậc Thầy"
            right={<Toggle value={masterNumbers} onChange={setMasterNumbers} />}
          />
          <SettingsRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            label="Hiện Ghi Chú Phương Pháp"
            right={<Toggle value={showMethodNotes} onChange={setShowMethodNotes} />}
          />
          <SettingsRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>}
            label="Phương Pháp Mặc Định"
            right={<ChevronRight />}
          />
          <SettingsRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
            label="Ngôn Ngữ Mặc Định"
            right={<ChevronRight />}
          />
        </SettingsGroup>

        {/* Data */}
        <SectionLabel title="Dữ Liệu" />
        <SettingsGroup>
          <SettingsRow
            first
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
            label="Xuất Dữ Liệu CSV"
            right={<ChevronRight />}
          />
          <div
            onClick={() => window.open('/api/settings/export', '_blank')}
            style={{ cursor: 'pointer' }}
          >
            <SettingsRow
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
              label="Tải xuống toàn bộ dữ liệu khách hàng"
              right={<ChevronRight />}
            />
          </div>
          <SettingsRow
            danger
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>}
            label="Xoá Tất Cả Dữ Liệu"
            right={<ChevronRight danger />}
          />
        </SettingsGroup>

      </main>

      <BottomNav locale={locale} />
    </div>
  )
}
