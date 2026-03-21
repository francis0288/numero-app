'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter, usePathname } from '@/navigation'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage({ params: { locale } }: { params: { locale: string } }): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()
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
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setLoading(false)
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      setAuthError(locale === 'vi' ? 'Email hoặc mật khẩu không đúng' : 'Incorrect email or password')
    }
  }

  const isVietnamese = locale === 'vi'

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">✨</div>
        <h1 className="text-2xl font-medium text-[#7B5EA7]">NumeroApp</h1>
        <p className="text-[#888888] mt-1 text-sm">
          {isVietnamese ? 'Bài đọc số học chuyên nghiệp' : 'Professional numerology readings'}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-8 w-full max-w-[400px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVietnamese ? 'Địa chỉ email' : 'Email address'}
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border border-[#E8E0F0] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-[#2C2C2C] text-sm"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
              {isVietnamese ? 'Mật khẩu' : 'Password'}
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
            {loading
              ? (isVietnamese ? 'Đang đăng nhập…' : 'Signing in…')
              : (isVietnamese ? 'Đăng nhập' : 'Sign in')}
          </button>

          {/* Forgot password */}
          <div className="text-center mt-4">
            <button type="button" className="text-[#888888] text-sm hover:text-[#7B5EA7] transition-colors">
              {isVietnamese ? 'Quên mật khẩu?' : 'Forgot password?'}
            </button>
          </div>
        </form>
      </div>

      {/* Language toggle */}
      <div className="mt-6">
        <button
          onClick={() => router.replace(pathname, { locale: isVietnamese ? 'en' : 'vi' })}
          className={
            isVietnamese
              ? 'border border-[#E8E0F0] text-[#888888] rounded-full px-4 py-1.5 text-sm hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors'
              : 'bg-[#7B5EA7] text-white rounded-full px-4 py-1.5 text-sm transition-colors'
          }
        >
          {isVietnamese ? '🌐 ENG' : '🌐 TIẾNG VIỆT'}
        </button>
      </div>
    </div>
  )
}
