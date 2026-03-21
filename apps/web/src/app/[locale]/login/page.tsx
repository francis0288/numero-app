'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/navigation'

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage(): React.ReactElement {
  const router = useRouter()
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setAuthError('')
    const result = await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      setAuthError('Tên đăng nhập hoặc mật khẩu không đúng')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">✨</div>
        <h1 className="text-2xl font-medium text-[#7B5EA7]">NumeroApp</h1>
        <p className="text-[#888888] mt-1 text-sm">Công cụ thần số học chuyên nghiệp</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-8 w-full max-w-[400px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Tên đăng nhập */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Tên đăng nhập
            </label>
            <input
              {...register('username')}
              type="text"
              autoComplete="username"
              placeholder="Hương Thảo"
              className="w-full border border-[#E8E0F0] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-[#2C2C2C] text-sm"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              Mật khẩu
            </label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-[#E8E0F0] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-[#2C2C2C] text-sm"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Auth error */}
          {authError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {authError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B5EA7] text-white rounded-xl px-6 py-3 font-medium hover:bg-[#6A4F96] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
