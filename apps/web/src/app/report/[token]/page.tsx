import React from 'react'
import { prisma } from '@/lib/prisma'
import { calculateFullForecast, calculateFullProfile } from '@numero-app/core'
import type { NumerologyProfile } from '@numero-app/core'
import { ReportClient } from './ReportClient'

function getNumberKey(r: { value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean; karmicDebtNumber?: number }): string {
  if (r.isKarmicDebt && r.karmicDebtNumber) return `karmic_debt_${r.karmicDebtNumber}`
  if (r.isMasterNumber) return `master_${r.value}`
  return `life_path_${r.value}`
}

function reduceDigit(n: number): number {
  if (n === 0) return 0
  while (n > 9) n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0)
  return n
}

const ErrorPage = ({ msg, sub }: { msg: string; sub: string }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0D0D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 56, marginBottom: 24 }}>✨</div>
      <h2 style={{ color: '#D4AC6E', fontSize: 20, fontWeight: 500, marginBottom: 12 }}>{msg}</h2>
      <p style={{ color: '#888899', fontSize: 14 }}>{sub}</p>
    </div>
  </div>
)

export default async function ReportPage({ params }: { params: { token: string } }) {
  const client = await prisma.client.findUnique({
    where: { shareToken: params.token },
    include: { user: true },
  })

  if (!client) return <ErrorPage msg="Report not found" sub="This report link is invalid or has been removed." />

  const reading = await prisma.reading.findFirst({
    where: { clientId: client.id, status: 'finalised' },
    orderBy: { version: 'desc' },
  })

  if (!reading) return <ErrorPage msg="Reading not ready yet" sub="Your practitioner is still preparing your reading." />

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]

  const profile: NumerologyProfile = reading.profileJSON
    ? JSON.parse(reading.profileJSON)
    : calculateFullProfile({ birthDate: birthDateStr, birthCertName: client.birthCertName, currentName: client.currentName })

  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1

  const forecastCurr = calculateFullForecast({
    birthDate: birthDateStr,
    birthCertName: client.birthCertName,
    lifePath: profile.lifePath,
    targetDate: `${currentYear}-06-15`,
  })

  const forecastNext = calculateFullForecast({
    birthDate: birthDateStr,
    birthCertName: client.birthCertName,
    lifePath: profile.lifePath,
    targetDate: `${nextYear}-06-15`,
  })

  // Isolation number = |Destiny.value - Soul.value| reduced to single digit
  const isolationNumber = reduceDigit(Math.abs(profile.destiny.methodA.value - profile.soul.methodA.value))

  // Unique karmic debt compound numbers across all core numbers
  const allNums = [profile.lifePath, profile.destiny.methodA, profile.soul.methodA, profile.personality.methodA, profile.maturity, profile.birthDay, profile.currentName]
  const karmicDebtNums = [...new Set(allNums.filter(r => r.isKarmicDebt && r.karmicDebtNumber).map(r => r.karmicDebtNumber!))]

  // Build all interpretation keys
  const coreKeys = allNums.map(getNumberKey)
  const lessonKeys = profile.karmicLessons.map(n => `karmic_lesson_${n}`)
  const debtKeys = karmicDebtNums.map(n => `karmic_debt_${n}`)

  // Single-digit life_path_N keys for isolation, personal years, pinnacles, challenges
  const numericKeys = new Set<number>()
  if (isolationNumber > 0) numericKeys.add(isolationNumber)
  numericKeys.add(forecastCurr.personalYear.value)
  numericKeys.add(forecastNext.personalYear.value)
  const pinCurr = forecastCurr.pinnacles.find(p => p.isCurrent)
  const chCurr = forecastCurr.challenges.find(c => c.isCurrent)
  const pinNext = forecastNext.pinnacles.find(p => p.isCurrent)
  const chNext = forecastNext.challenges.find(c => c.isCurrent)
  if (pinCurr) numericKeys.add(pinCurr.number.value)
  if (chCurr) numericKeys.add(chCurr.number)
  if (pinNext) numericKeys.add(pinNext.number.value)
  if (chNext) numericKeys.add(chNext.number)
  const extraKeys = [...numericKeys].map(n => `life_path_${n}`)

  const allKeys = [...new Set([...coreKeys, ...lessonKeys, ...debtKeys, ...extraKeys])]

  const [interpRowsVi, interpRowsEn] = await Promise.all([
    prisma.interpretation.findMany({ where: { numberKey: { in: allKeys }, locale: 'vi' } }),
    prisma.interpretation.findMany({ where: { numberKey: { in: allKeys }, locale: 'en' } }),
  ])
  const interpretations_vi = Object.fromEntries(interpRowsVi.map(r => [r.numberKey, JSON.parse(r.baseText)]))
  const interpretations_en = Object.fromEntries(interpRowsEn.map(r => [r.numberKey, JSON.parse(r.baseText)]))

  return (
    <ReportClient
      clientData={{
        firstName: client.firstName,
        middleName: client.middleName,
        lastName: client.lastName,
        dateOfBirth: client.dateOfBirth.toISOString(),
      }}
      readingData={{
        createdAt: reading.createdAt.toISOString(),
        aiNarrative: reading.aiNarrative ?? null,
        editedNarrative: reading.editedNarrative ?? null,
      }}
      profile={profile}
      forecastCurr={forecastCurr}
      forecastNext={forecastNext}
      currentYear={currentYear}
      nextYear={nextYear}
      interpretations_vi={interpretations_vi}
      interpretations_en={interpretations_en}
      practitioner={{
        name: client.user.name,
        logoUrl: client.user.logoUrl ?? null,
        brandingFooter: client.user.brandingFooter ?? null,
        phone: client.user.phone ?? null,
        brandingEmail: client.user.brandingEmail ?? null,
      }}
      token={params.token}
      karmicDebtNums={karmicDebtNums}
      isolationNumber={isolationNumber}
    />
  )
}
