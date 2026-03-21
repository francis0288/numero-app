'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from '@/navigation'
import { useParams } from 'next/navigation'
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

export default function EditClientPage() {
  const params = useParams()
  const id = params.id as string
  const locale = (params.locale as string) ?? 'vi'
  const router = useRouter()
  const isVi = locale === 'vi'

  const [displayName, setDisplayName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'vi' | 'en'>('vi')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const strippedName = stripVi(displayName)

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(async (r) => {
        if (!r.ok) return
        const data = await r.json() as {
          firstName: string
          dateOfBirth: string
          preferredLanguage: string
          notes?: string | null
        }
        setDisplayName(data.firstName)
        setDateOfBirth(data.dateOfBirth.slice(0, 10))
        setPreferredLanguage((data.preferredLanguage as 'vi' | 'en') || 'vi')
        setNotes(data.notes ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, dateOfBirth, preferredLanguage, notes: notes || undefined }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        setServerError(err.error ?? (isVi ? 'Có lỗi xảy ra' : 'Something went wrong'))
        setSubmitting(false)
        return
      }
      router.push(`/clients/${id}/profile`)
    } catch {
      setServerError(isVi ? 'Lỗi kết nối — vui lòng thử lại' : 'Network error — please try again')
      setSubmitting(false)
    }
  }

  const profilePath = locale === 'en' ? `/clients/${id}/profile` : `/${locale}/clients/${id}/profile`

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6EC]">
        <NavBar locale={locale} />
        <main className="max-w-[640px] mx-auto px-4 py-8">
          <div className="text-[#888888] text-sm">{isVi ? 'Đang tải…' : 'Loading…'}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#2C2C2C]">{isVi ? 'Chỉnh sửa khách hàng' : 'Edit Client'}</h1>
          <p className="text-[#888888] text-sm mt-1">{isVi ? 'Cập nhật thông tin khách hàng.' : "Update the client's details."}</p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-5">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Họ và tên' : 'Full name'}<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
            />
            {strippedName && (
              <p className="text-xs text-[#888888] mt-1">
                {isVi ? 'Dùng để tính số:' : 'Used for calculation:'} <span className="font-medium text-[#7B5EA7]">{strippedName}</span>
              </p>
            )}
          </div>

          {/* Date of birth */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Ngày sinh' : 'Date of birth'}<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Preferred language */}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVi ? 'Ghi chú (tùy chọn)' : 'Notes (optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={isVi ? 'Ghi chú từ buổi tư vấn…' : 'Notes from the session…'}
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
              {submitting ? (isVi ? 'Đang lưu…' : 'Saving…') : (isVi ? 'Lưu thay đổi' : 'Save changes')}
            </button>
            <a
              href={profilePath}
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
