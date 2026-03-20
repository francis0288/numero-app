import { prisma } from '@/lib/prisma'
import { calculateFullForecast, calculateFullProfile } from '@numero-app/core'
import type { NumerologyProfile } from '@numero-app/core'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReadingPDF } from '@/components/ReadingPDF'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const client = await prisma.client.findUnique({
    where: { shareToken: params.token },
    include: { user: true },
  })
  if (!client) return Response.json({ error: 'not_found' }, { status: 404 })

  const reading = await prisma.reading.findFirst({
    where: { clientId: client.id, status: 'finalised' },
    orderBy: { version: 'desc' },
  })
  if (!reading) return Response.json({ error: 'not_ready' }, { status: 404 })

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]

  const profile: NumerologyProfile = reading.profileJSON
    ? JSON.parse(reading.profileJSON)
    : calculateFullProfile({ birthDate: birthDateStr, birthCertName: client.birthCertName, currentName: client.currentName })

  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1

  const forecastCurr = calculateFullForecast({
    birthDate: birthDateStr, birthCertName: client.birthCertName, lifePath: profile.lifePath,
    targetDate: `${currentYear}-06-15`,
  })
  const forecastNext = calculateFullForecast({
    birthDate: birthDateStr, birthCertName: client.birthCertName, lifePath: profile.lifePath,
    targetDate: `${nextYear}-06-15`,
  })

  const isolationNumber = reduceDigit(Math.abs(profile.destiny.value - profile.soul.value))

  const allNums = [profile.lifePath, profile.destiny, profile.soul, profile.personality, profile.maturity, profile.birthDay, profile.currentName]
  const karmicDebtNums = [...new Set(allNums.filter(r => r.isKarmicDebt && r.karmicDebtNumber).map(r => r.karmicDebtNumber!))]

  const coreKeys = allNums.map(getNumberKey)
  const lessonKeys = profile.karmicLessons.map(n => `karmic_lesson_${n}`)
  const debtKeys = karmicDebtNums.map(n => `karmic_debt_${n}`)
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
  const interpRows = await prisma.interpretation.findMany({
    where: { numberKey: { in: allKeys }, locale: client.preferredLanguage },
  })
  const interpretations = Object.fromEntries(interpRows.map(r => [r.numberKey, JSON.parse(r.baseText)]))

  try {
    const buffer = await renderToBuffer(
      React.createElement(ReadingPDF, {
        client: { firstName: client.firstName, lastName: client.lastName, dateOfBirth: client.dateOfBirth },
        reading: { createdAt: reading.createdAt, aiNarrative: reading.aiNarrative, editedNarrative: reading.editedNarrative },
        profile,
        forecastCurr,
        forecastNext,
        currentYear,
        nextYear,
        interpretations,
        practitioner: { name: client.user.name, logoUrl: client.user.logoUrl, brandingFooter: client.user.brandingFooter },
        karmicDebtNums,
        isolationNumber,
      }) as React.ReactElement
    )

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reading-${client.firstName}-${client.lastName}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return Response.json({ error: 'PDF generation failed', detail: String(err) }, { status: 500 })
  }
}
