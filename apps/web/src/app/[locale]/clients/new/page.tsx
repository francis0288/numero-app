'use client'

import React from 'react'
import { useState } from 'react'
import { useRouter } from '@/navigation'
import { NavBar } from '@/components/NavBar'

function stripVi(name: string): string {
  const map: Record<string, string> = {
    à:'a',á:'a',â:'a',ã:'a',ă:'a',ạ:'a',ả:'a',ấ:'a',ầ:'a',ẩ:'a',ẫ:'a',ậ:'a',ắ:'a',ằ:'a',ẳ:'a',ẵ:'a',ặ:'a',
    è:'e',é:'e',ê:'e',ẹ:'e',ẻ:'e',ẽ:'e',ế:'e',ề:'e',ể:'e',ễ:'e',ệ:'e',
    ì:'i',í:'i',î:'i',ị:'i',ỉ:'i',ĩ:'i',
    ò:'o',ó:'o',ô:'o',õ:'o',ơ:'o',ọ:'o',ỏ:'o',ố:'o',ồ:'o',ổ:'o',ỗ:'o',ộ:'o',ớ:'o',ờ:'o',ở:'o',ỡ:'o',ợ:'o',
    ù:'u',ú:'u',û:'u',ư:'u',ụ:'u',ủ:'u',ứ:'u',ừ:'u',ử:'u',ữ:'u',ự:'u',ũ:'u',
    ỳ:'y',ý:'y',ỵ:'y',ỷ:'y',ỹ:'y',
    đ:'d',
  }
  return name.split('').map(c => {
    const lower = c.toLowerCase()
    const mapped = map[lower]
    if (mapped) return c === lower ? mapped : mapped.toUpperCase()
    return c
  }).join('').toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ').trim()
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '0.5px solid var(--color-border)',
  borderRadius: 12,
  padding: '12px 14px',
  backgroundColor: 'var(--color-white)',
  fontSize: 14,
  color: 'var(--color-dark)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-ui)',
  appearance: 'none',
}

export default function NewClientPage({ params: { locale } }: { params: { locale: string } }): React.ReactElement {
  const router = useRouter()
  const [ho, setHo] = useState('')
  const [tenDem, setTenDem] = useState('')
  const [ten, setTen] = useState('')
  const [motherName, setMotherName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'vi' | 'en'>('vi')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const strippedHo     = stripVi(ho)
  const strippedTenDem = stripVi(tenDem)
  const strippedTen    = stripVi(ten)
  const strippedMother = stripVi(motherName)

  const combinedPreview = [strippedHo, strippedTenDem, strippedTen].filter(Boolean).join(' | ')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!ho.trim()) e.ho = 'Vui lòng nhập họ'
    if (!ten.trim()) e.ten = 'Vui lòng nhập tên'
    if (!dateOfBirth) e.dateOfBirth = 'Vui lòng nhập ngày sinh'
    else if (new Date(dateOfBirth) >= new Date()) e.dateOfBirth = 'Ngày sinh phải là ngày trong quá khứ'
    return e
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ho,
          tenDem: tenDem || undefined,
          ten,
          motherName: motherName || undefined,
          dateOfBirth,
          preferredLanguage,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setServerError(err.error ?? 'Có lỗi xảy ra')
        setSubmitting(false)
        return
      }
      const { id } = await res.json() as { id: string }
      router.push(`/clients/${id}/profile`)
    } catch {
      setServerError('Lỗi kết nối — vui lòng thử lại')
      setSubmitting(false)
    }
  }

  const dashboardPath = locale === 'en' ? '/dashboard' : `/${locale}/dashboard`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 60px' }}>

        {/* Header */}
        <div style={{ padding: '20px 16px 16px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 400, color: 'var(--color-dark)', margin: 0, lineHeight: 1.2 }}>
            Khách Hàng Mới
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-mid)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
            Nhập thông tin để tính số học
          </p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} noValidate style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Họ */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Họ <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={ho}
              onChange={(e) => { setHo(e.target.value); setErrors(prev => ({ ...prev, ho: '' })) }}
              placeholder="Lê"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
              Tên họ — VD: Lê, Nguyễn, Trần
            </p>
            {strippedHo && (
              <p style={{ fontSize: 11, color: 'var(--color-gold)', margin: '2px 0 0', fontFamily: 'monospace' }}>{strippedHo}</p>
            )}
            {errors.ho && <p style={{ fontSize: 11, color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.ho}</p>}
          </div>

          {/* Tên đệm */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Tên đệm
            </label>
            <input
              type="text"
              value={tenDem}
              onChange={(e) => setTenDem(e.target.value)}
              placeholder="Thị"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
              Tên đệm nếu có — VD: Thị, Văn, Minh
            </p>
            {strippedTenDem && (
              <p style={{ fontSize: 11, color: 'var(--color-gold)', margin: '2px 0 0', fontFamily: 'monospace' }}>{strippedTenDem}</p>
            )}
          </div>

          {/* Tên */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Tên <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={ten}
              onChange={(e) => { setTen(e.target.value); setErrors(prev => ({ ...prev, ten: '' })) }}
              placeholder="Thanh Tình"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
              Tên gọi — VD: Thanh Tình, Hùng, Lan
            </p>
            {strippedTen && (
              <p style={{ fontSize: 11, color: 'var(--color-gold)', margin: '2px 0 0', fontFamily: 'monospace' }}>{strippedTen}</p>
            )}
            {errors.ten && <p style={{ fontSize: 11, color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.ten}</p>}
          </div>

          {/* Combined preview */}
          {combinedPreview && (
            <div style={{
              backgroundColor: 'rgba(196,146,42,0.08)',
              border: '0.5px solid rgba(196,146,42,0.3)',
              borderRadius: 12,
              padding: '10px 14px',
            }}>
              <p style={{ fontSize: 10, color: 'var(--color-gold)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                Tên đầy đủ để tính số
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-dark)', margin: 0, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                {combinedPreview}
              </p>
            </div>
          )}

          {/* Ngày sinh */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Ngày sinh <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => { setDateOfBirth(e.target.value); setErrors(prev => ({ ...prev, dateOfBirth: '' })) }}
              style={inputStyle}
            />
            {errors.dateOfBirth && <p style={{ fontSize: 11, color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.dateOfBirth}</p>}
          </div>

          {/* Tên mẹ */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Tên mẹ (tùy chọn)
            </label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="VD: Trần Thị Mai"
              style={inputStyle}
            />
            {strippedMother && (
              <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
                Dùng để tính số: <span style={{ color: 'var(--color-gold)', fontWeight: 500 }}>{strippedMother}</span>
              </p>
            )}
          </div>

          {/* Ngôn ngữ */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Ngôn ngữ báo cáo
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['vi', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPreferredLanguage(lang)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    border: preferredLanguage === lang ? 'none' : '0.5px solid var(--color-border)',
                    backgroundColor: preferredLanguage === lang ? 'var(--color-gold)' : 'var(--color-white)',
                    color: preferredLanguage === lang ? 'white' : 'var(--color-mid)',
                  }}
                >
                  {lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ghi chú buổi làm việc hôm nay..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {serverError && (
            <div style={{
              backgroundColor: 'rgba(163,45,45,0.06)',
              border: '0.5px solid rgba(163,45,45,0.3)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 13,
              color: 'var(--color-danger)',
            }}>
              {serverError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-gold)',
                color: 'white',
                borderRadius: 14,
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'var(--font-ui)',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Đang tính…' : 'Tính số →'}
            </button>
            <a
              href={dashboardPath}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                border: '0.5px solid var(--color-border)',
                color: 'var(--color-mid)',
                borderRadius: 14,
                padding: '14px 24px',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-ui)',
                textDecoration: 'none',
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              Hủy
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
