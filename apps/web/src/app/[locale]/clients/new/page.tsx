'use client'

import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from '@/navigation'
import { NavBar } from '@/components/NavBar'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  birthCertName: z.string().min(1, 'Birth certificate name is required'),
  currentName: z.string().min(1, 'Current name is required'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((d) => new Date(d) < new Date(), { message: 'Date of birth must be in the past' }),
  preferredLanguage: z.enum(['vi', 'en']).default('vi'),
  motherName: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const LANG_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
] as const

function Field({
  label,
  required,
  helper,
  error,
  children,
}: {
  label: string
  required?: boolean
  helper?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {helper && <p className="text-xs text-[#888888] mt-1">{helper}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full border border-[#E8E0F0] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] text-[#2C2C2C] text-sm'

export default function NewClientPage({ params: { locale } }: { params: { locale: string } }): React.ReactElement {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLanguage: 'vi' },
  })

  const selectedLang = watch('preferredLanguage')

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setServerError(err.error?.formErrors?.[0] ?? 'Something went wrong')
        setSubmitting(false)
        return
      }
      const { id } = await res.json()
      router.push(`/clients/${id}/profile`)
    } catch {
      setServerError('Network error — please try again')
      setSubmitting(false)
    }
  }

  const dashboardPath = locale === 'en' ? '/dashboard' : `/${locale}/dashboard`

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#2C2C2C]">New Client</h1>
          <p className="text-[#888888] text-sm mt-1">
            Enter the client&apos;s details to calculate their numerology profile.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Row 1: First + Middle */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" required error={errors.firstName?.message}>
              <input {...register('firstName')} type="text" className={inputClass} />
            </Field>
            <Field label="Middle name" error={errors.middleName?.message}>
              <input {...register('middleName')} type="text" className={inputClass} />
            </Field>
          </div>

          {/* Row 2: Last name */}
          <Field label="Last name" required error={errors.lastName?.message}>
            <input {...register('lastName')} type="text" className={inputClass} />
          </Field>

          {/* Row 3: Birth cert name */}
          <Field
            label="Birth certificate full name"
            required
            helper="As it appears on the original birth certificate — used to calculate Destiny, Soul &amp; Personality numbers"
            error={errors.birthCertName?.message}
          >
            <input
              {...register('birthCertName')}
              type="text"
              className={`${inputClass} uppercase`}
              onChange={(e) => setValue('birthCertName', e.target.value.toUpperCase())}
            />
          </Field>

          {/* Row 4: Date of birth */}
          <Field label="Date of birth" required error={errors.dateOfBirth?.message}>
            <input {...register('dateOfBirth')} type="date" className={inputClass} />
          </Field>

          {/* Row 5: Current name */}
          <Field
            label="Current name"
            required
            helper="The name they use today"
            error={errors.currentName?.message}
          >
            <input
              {...register('currentName')}
              type="text"
              className={`${inputClass} uppercase`}
              onChange={(e) => setValue('currentName', e.target.value.toUpperCase())}
            />
          </Field>

          {/* Row 5b: Mother's name */}
          <Field
            label={locale === 'vi' ? "Tên mẹ (tùy chọn)" : "Mother's name (optional)"}
            helper={locale === 'vi' ? "Nhập không dấu — VD: NGUYEN THI HOA" : "Enter without diacritics — e.g. NGUYEN THI HOA"}
          >
            <input
              {...register('motherName')}
              type="text"
              className={`${inputClass} uppercase`}
              onChange={(e) => setValue('motherName', e.target.value.toUpperCase())}
            />
          </Field>

          {/* Row 6: Preferred language */}
          <Field label="Preferred language for reports">
            <div className="flex gap-2">
              {LANG_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('preferredLanguage', value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    selectedLang === value
                      ? 'bg-[#7B5EA7] text-white'
                      : 'border border-[#E8E0F0] text-[#888888] hover:border-[#7B5EA7] hover:text-[#7B5EA7]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Row 7: Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className={inputClass} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register('phone')} type="tel" className={inputClass} />
            </Field>
          </div>

          {/* Row 8: Notes */}
          <Field label="Session notes">
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Notes from today's session…"
              className={`${inputClass} resize-none`}
            />
          </Field>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#7B5EA7] text-white rounded-xl px-6 py-3 font-medium hover:bg-[#6A4F96] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Calculating…' : 'Calculate numbers →'}
            </button>
            <a
              href={dashboardPath}
              className="block w-full text-center border border-[#7B5EA7] text-[#7B5EA7] rounded-xl px-6 py-3 text-sm font-medium hover:bg-[#F5F0FB] transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
