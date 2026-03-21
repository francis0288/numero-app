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
  const [displayName, setDisplayName] = useState('')
  const [motherName, setMotherName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'vi' | 'en'>('vi')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const strippedName = stripVi(displayName)
  const strippedMother = stripVi(motherName)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!displayName.trim()) e.displayName = locale === 'vi' ? 'Vui lòng nhập họ và tên' : 'Name is required'
    if (!dateOfBirth) e.dateOfBirth = locale === 'vi' ? 'Vui lòng nhập ngày sinh' : 'Date of birth is required'
    else if (new Date(dateOfBirth) >= new Date()) e.dateOfBirth = locale === 'vi' ? 'Ngày sinh phải là ngày trong quá khứ' : 'Date of birth must be in the past'
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
        body: JSON.stringify({ displayName, motherName: motherName || undefined, dateOfBirth, preferredLanguage, notes: notes || undefined }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setServerError(err.error ?? (locale === 'vi' ? 'Có lỗi xảy ra' : 'Something went wrong'))
        setSubmitting(false)
        return
      }
      const { id } = await res.json() as { id: string }
      router.push(`/clients/${id}/profile`)
    } catch {
      setServerError(locale === 'vi' ? 'Lỗi kết nối — vui lòng thử lại' : 'Network error — please try again')
      setSubmitting(false)
    }
  }

  const dashboardPath = locale === 'en' ? '/dashboard' : `/${locale}/dashboard`
  const isVi = locale === 'vi'

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#2C2C2C]">{isVi ? 'Thêm khách hàng mới' : 'New Client'}</h1>
          <p className="text-[#888888] text-sm mt-1">
            {isVi ? 'Nhập thông tin để tính số học' : 'Enter details to calculate the numerology profile'}
          </p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-5">
          {/* Field 1: Full name */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Họ và tên' : 'Full name'}<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setErrors(prev => ({ ...prev, displayName: '' })) }}
              placeholder={isVi ? 'VD: Nguyễn Thị Hoa' : 'e.g. Nguyen Thi Hoa'}
              className={inputClass}
            />
            {strippedName && (
              <p className="text-xs text-[#888888] mt-1">
                {isVi ? 'Dùng để tính số:' : 'Used for calculation:'} <span className="font-medium text-[#7B5EA7]">{strippedName}</span>
              </p>
            )}
            {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
          </div>

          {/* Field 2: Date of birth */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Ngày sinh' : 'Date of birth'}<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => { setDateOfBirth(e.target.value); setErrors(prev => ({ ...prev, dateOfBirth: '' })) }}
              className={inputClass}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

          {/* Field 3: Mother's name (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Tên mẹ (tùy chọn)' : "Mother's name (optional)"}
            </label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder={isVi ? 'VD: Trần Thị Mai' : 'e.g. Tran Thi Mai'}
              className={inputClass}
            />
            {strippedMother && (
              <p className="text-xs text-[#888888] mt-1">
                {isVi ? 'Dùng để tính số:' : 'Used for calculation:'} <span className="font-medium text-[#7B5EA7]">{strippedMother}</span>
              </p>
            )}
          </div>

          {/* Field 4: Preferred language */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Ngôn ngữ báo cáo' : 'Report language'}
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
                  {lang === 'vi' ? 'Tiếng Việt' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Field 5: Notes */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Ghi chú (tùy chọn)' : 'Notes (optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={isVi ? 'Ghi chú từ buổi tư vấn…' : "Notes from today's session…"}
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
              {submitting ? (isVi ? 'Đang tính…' : 'Calculating…') : (isVi ? 'Tính số học →' : 'Calculate numbers →')}
            </button>
            <a
              href={dashboardPath}
              className="block w-full text-center border border-[#7B5EA7] text-[#7B5EA7] rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#F5F0FB] transition-colors"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
