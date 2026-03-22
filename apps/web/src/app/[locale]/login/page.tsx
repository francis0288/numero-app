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
}

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
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: 'var(--color-gold)', marginBottom: 4 }}>✦</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: 'var(--color-dark)', margin: 0 }}>NumeroApp</h1>
        <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: '6px 0 0', fontFamily: 'var(--font-ui)' }}>
          Công cụ thần số học chuyên nghiệp
        </p>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 20,
        border: '0.5px solid var(--color-border)',
        padding: '32px 24px',
        width: '100%',
        maxWidth: 380,
        boxSizing: 'border-box',
      } as React.CSSProperties}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Tên đăng nhập */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Tên đăng nhập
            </label>
            <input
              {...register('username')}
              type="text"
              autoComplete="username"
              placeholder="Hương Thảo"
              style={inputStyle}
            />
            {errors.username && (
              <p style={{ fontSize: 11, color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.username.message}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-ui)' }}>
              Mật khẩu
            </label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={inputStyle}
            />
            {errors.password && (
              <p style={{ fontSize: 11, color: 'var(--color-danger)', margin: '4px 0 0' }}>{errors.password.message}</p>
            )}
          </div>

          {/* Auth error */}
          {authError && (
            <div style={{
              marginBottom: 16,
              backgroundColor: 'rgba(163,45,45,0.06)',
              border: '0.5px solid rgba(163,45,45,0.3)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 13,
              color: 'var(--color-danger)',
            }}>
              {authError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
