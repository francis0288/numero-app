import React from 'react'
import { prisma } from '@/lib/prisma'
import {
  calculateFullForecast,
  calculateFullProfile,
} from '@numero-app/core'
import type { NumerologyProfile, NumberResult } from '@numero-app/core'

function getNumberKey(result: NumberResult): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) return `karmic_debt_${result.karmicDebtNumber}`
  if (result.isMasterNumber) return `master_${result.value}`
  return `life_path_${result.value}`
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MarkdownReading({ text }: { text: string }) {
  const sections = text.split(/\n(?=## )/)
  return (
    <div>
      {sections.map((section, i) => {
        const lines = section.split('\n')
        const heading = lines[0].replace(/^## /, '').trim()
        const body = lines.slice(1).join('\n').trim()
        const paragraphs = body.split(/\n\n+/).filter(Boolean)
        return (
          <div key={i}>
            {heading && (
              <h2 className="text-[#7B5EA7] font-medium text-xl mt-10 mb-4 pb-2 border-b border-[#E8E0F0]">
                {heading}
              </h2>
            )}
            {paragraphs.map((para, j) => (
              <p key={j} className="text-[#2C2C2C] leading-relaxed mb-4 text-base">
                {para}
              </p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

const CORE_LABELS: Record<string, string> = {
  destiny: 'Destiny Number',
  soul: 'Soul Number',
  personality: 'Personality Number',
  maturity: 'Maturity Number',
  birthDay: 'Birthday Number',
  currentName: 'Current Name Number',
}

export default async function ReportPage({
  params,
}: {
  params: { token: string }
}) {
  const client = await prisma.client.findUnique({
    where: { shareToken: params.token },
    include: { user: true },
  })

  if (!client) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-xl font-medium text-[#2C2C2C] mb-3">Report not found</h2>
          <p className="text-[#888888] text-sm">This report link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  const reading = await prisma.reading.findFirst({
    where: { clientId: client.id, status: 'finalised' },
    orderBy: { version: 'desc' },
  })

  if (!reading) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-xl font-medium text-[#2C2C2C] mb-3">Reading not ready yet</h2>
          <p className="text-[#888888] text-sm">Your practitioner is still preparing your reading.</p>
        </div>
      </div>
    )
  }

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]

  const profile: NumerologyProfile = reading.profileJSON
    ? JSON.parse(reading.profileJSON)
    : calculateFullProfile({
        birthDate: birthDateStr,
        birthCertName: client.birthCertName,
        currentName: client.currentName,
      })

  const forecast = calculateFullForecast({
    birthDate: birthDateStr,
    birthCertName: client.birthCertName,
    lifePath: profile.lifePath,
  })

  const coreEntries: [string, NumberResult][] = [
    ['destiny', profile.destiny],
    ['soul', profile.soul],
    ['personality', profile.personality],
    ['maturity', profile.maturity],
    ['birthDay', profile.birthDay],
    ['currentName', profile.currentName],
  ]

  const numberKeys = [
    getNumberKey(profile.lifePath),
    ...coreEntries.map(([, r]) => getNumberKey(r)),
  ]

  const interpRows = await prisma.interpretation.findMany({
    where: { numberKey: { in: numberKeys }, locale: client.preferredLanguage },
  })
  const interpMap = Object.fromEntries(
    interpRows.map((r) => [r.numberKey, JSON.parse(r.baseText) as { title?: string; overview?: string }])
  )

  const lifePathKey = getNumberKey(profile.lifePath)
  const lifePathInterp = interpMap[lifePathKey]
  const narrative = reading.editedNarrative ?? reading.aiNarrative ?? ''
  const token = params.token

  return (
    <div className="min-h-screen bg-[#FDF6EC]">

      {/* ── Section 1: Cover ── */}
      <section className="relative bg-[#7B5EA7] py-20 text-center overflow-hidden">
        {/* Decorative background number */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden
        >
          <span
            className="font-bold text-white"
            style={{ fontSize: 180, opacity: 0.06, lineHeight: 1 }}
          >
            {profile.lifePath.display}
          </span>
        </div>

        <div className="relative max-w-2xl mx-auto px-4">
          {/* Practitioner branding */}
          <div className="mb-6">
            {client.user.logoUrl && (
              <img
                src={client.user.logoUrl}
                alt={client.user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/30 mx-auto mb-3"
              />
            )}
            <p className="text-white/70 text-sm font-medium">
              A reading by {client.user.name}
            </p>
          </div>

          <h1 className="text-4xl font-medium text-white mt-6">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-white/60 text-lg mt-2">Numerology Reading</p>
          <p className="text-white/40 text-sm mt-1">{formatDate(reading.createdAt)}</p>
          <p className="text-white/40 text-xs mt-8 animate-bounce">↓ Scroll to read your reading</p>
        </div>
      </section>

      {/* ── Section 2: Core Numbers ── */}
      <section className="bg-[#FDF6EC] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-[#7B5EA7] text-2xl font-medium text-center mb-10">Your Numbers</h2>

          {/* Life Path hero */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-8 mb-6 flex gap-6 items-start">
            <div className="shrink-0 text-7xl font-bold text-[#7B5EA7] leading-none">
              {profile.lifePath.display}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#888888] uppercase tracking-wider mb-1">Life Path Number</p>
              {lifePathInterp?.title && (
                <p className="text-xl font-medium text-[#2C2C2C] mb-2">{lifePathInterp.title}</p>
              )}
              {lifePathInterp?.overview && (
                <p className="text-sm text-[#888888] leading-relaxed">
                  {lifePathInterp.overview.slice(0, 150)}...
                </p>
              )}
            </div>
          </div>

          {/* 6 core numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreEntries.map(([fieldKey, result]) => {
              const nKey = getNumberKey(result)
              const interp = interpMap[nKey]
              return (
                <div key={fieldKey} className="bg-white rounded-2xl border border-[#E8E0F0] p-5">
                  <p className="text-xs text-[#888888] uppercase tracking-wider mb-2">
                    {CORE_LABELS[fieldKey]}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-[#7B5EA7]">{result.display}</span>
                    {result.isMasterNumber && (
                      <span className="bg-[#FFFBF0] text-[#D4AC6E] border border-[#D4AC6E] rounded-full px-2 py-0.5 text-xs">
                        Master
                      </span>
                    )}
                  </div>
                  {interp?.title && (
                    <p className="text-sm font-medium text-[#2C2C2C]">{interp.title}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: The Reading ── */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-[#7B5EA7] text-2xl font-medium mb-10">Your Reading</h2>
          {narrative ? (
            <MarkdownReading text={narrative} />
          ) : (
            <p className="text-[#888888]">Reading content not available.</p>
          )}
        </div>
      </section>

      {/* ── Section 4: Year Ahead ── */}
      <section className="bg-[#F5F0FB] py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-[#7B5EA7] text-2xl font-medium text-center mb-8">Your Year Ahead</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Personal Year', result: forecast.personalYear },
              { label: 'Personal Month', result: forecast.personalMonth },
              { label: 'Personal Day', result: forecast.personalDay },
            ].map(({ label, result }) => (
              <div key={label} className="bg-white rounded-2xl border border-[#E8E0F0] p-6 text-center">
                <div className="text-5xl font-bold text-[#7B5EA7] mb-2">{result.display}</div>
                <div className="text-sm text-[#888888]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Footer ── */}
      <section className="bg-[#2C2C2C] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/80 font-medium mb-2">✨ NumeroApp</p>
          <p className="text-white/50 text-sm mb-1">
            Reading prepared by {client.user.name}
          </p>
          {client.user.brandingFooter && (
            <p className="text-white/30 text-xs mb-4">{client.user.brandingFooter}</p>
          )}
          <p className="text-white/20 text-xs mb-8">{formatDate(reading.createdAt)}</p>

          <a
            href={`/api/report/${token}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#D4AC6E] text-[#2C2C2C] font-medium rounded-xl px-8 py-4 text-base hover:bg-[#C49B5D] transition-colors"
          >
            ⬇ Download PDF
          </a>
        </div>
      </section>

    </div>
  )
}
