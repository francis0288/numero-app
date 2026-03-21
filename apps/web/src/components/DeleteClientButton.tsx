'use client'

import React, { useState } from 'react'
import { useRouter } from '@/navigation'

export function DeleteClientButton({ clientId, clientName, locale }: {
  clientId: string
  clientName: string
  locale: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      if (res.ok) {
        const dashboardPath = locale === 'en' ? '/dashboard' : `/${locale}/dashboard`
        router.push(dashboardPath)
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-red-400 text-sm hover:text-red-600 transition-colors"
      >
        Xóa hồ sơ
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-sm text-red-700 mb-3">
        Bạn có chắc muốn xóa hồ sơ của <strong>{clientName}</strong>? Tất cả bài đọc sẽ bị xóa vĩnh viễn.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="border border-[#E8E0F0] text-[#2C2C2C] rounded-lg px-4 py-2 text-sm hover:border-[#7B5EA7] transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Đang xóa…' : 'Xóa'}
        </button>
      </div>
    </div>
  )
}
