'use client'

import React from 'react'
import { useState } from 'react'
import { useRouter } from '@/navigation'
import { NavBar } from '@/components/NavBar'

const inputClass =
  'w-full border border-[#E8E0F0] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-[#2C2C2C] text-sm'

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
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#2C2C2C]">Khách Hàng Mới</h1>
          <p className="text-[#888888] text-sm mt-1">
            Nhập thông tin để tính số học
          </p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-5">
          {/* Field 1: Họ */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Họ<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={ho}
              onChange={(e) => { setHo(e.target.value); setErrors(prev => ({ ...prev, ho: '' })) }}
              placeholder="Lê"
              className={inputClass}
            />
            <p className="text-xs text-[#888888] mt-1">Tên họ — VD: Lê, Nguyễn, Trần</p>
            {strippedHo && (
              <p className="font-mono text-xs text-[#7B5EA7] mt-0.5">{strippedHo}</p>
            )}
            {errors.ho && <p className="text-red-500 text-xs mt-1">{errors.ho}</p>}
          </div>

          {/* Field 2: Tên đệm */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Tên đệm
            </label>
            <input
              type="text"
              value={tenDem}
              onChange={(e) => setTenDem(e.target.value)}
              placeholder="Thị"
              className={inputClass}
            />
            <p className="text-xs text-[#888888] mt-1">Tên đệm nếu có — VD: Thị, Văn, Minh</p>
            {strippedTenDem && (
              <p className="font-mono text-xs text-[#7B5EA7] mt-0.5">{strippedTenDem}</p>
            )}
          </div>

          {/* Field 3: Tên */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Tên<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={ten}
              onChange={(e) => { setTen(e.target.value); setErrors(prev => ({ ...prev, ten: '' })) }}
              placeholder="Thanh Tình"
              className={inputClass}
            />
            <p className="text-xs text-[#888888] mt-1">Tên gọi — VD: Thanh Tình, Hùng, Lan</p>
            {strippedTen && (
              <p className="font-mono text-xs text-[#7B5EA7] mt-0.5">{strippedTen}</p>
            )}
            {errors.ten && <p className="text-red-500 text-xs mt-1">{errors.ten}</p>}
          </div>

          {/* Combined preview */}
          {combinedPreview && (
            <div>
              <p className="text-xs text-[#888888] mb-1">Tên đầy đủ để tính số:</p>
              <div className="font-mono text-xs text-[#7B5EA7] bg-[#F5F0FB] rounded p-2 mt-1">
                {combinedPreview}
              </div>
            </div>
          )}

          {/* Date of birth */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Ngày sinh<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => { setDateOfBirth(e.target.value); setErrors(prev => ({ ...prev, dateOfBirth: '' })) }}
              className={inputClass}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

          {/* Mother's name (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Tên mẹ (tùy chọn)
            </label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="VD: Trần Thị Mai"
              className={inputClass}
            />
            {strippedMother && (
              <p className="text-xs text-[#888888] mt-1">
                Dùng để tính số: <span className="font-medium text-[#7B5EA7]">{strippedMother}</span>
              </p>
            )}
          </div>

          {/* Preferred language */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Ngôn ngữ báo cáo
            </label>
            <div className="flex gap-2">
              {(['vi', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPreferredLanguage(lang)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    preferredLanguage === lang
                      ? 'bg-[#7B5EA7] text-white'
                      : 'border border-[#E8E0F0] text-[#888888] hover:border-[#7B5EA7] hover:text-[#7B5EA7]'
                  }`}
                >
                  {lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ghi chú buổi làm việc hôm nay..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#7B5EA7] text-white rounded-xl px-6 py-3 font-medium hover:bg-[#6A4F96] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Đang tính…' : 'Tính số →'}
            </button>
            <a
              href={dashboardPath}
              className="block w-full text-center border border-[#7B5EA7] text-[#7B5EA7] rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#F5F0FB] transition-colors"
            >
              Hủy
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
