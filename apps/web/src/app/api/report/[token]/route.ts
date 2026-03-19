import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateFullForecast,
  calculateFullProfile,
} from '@numero-app/core'
import type { NumerologyProfile } from '@numero-app/core'

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const client = await prisma.client.findUnique({
    where: { shareToken: params.token },
    include: { user: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const reading = await prisma.reading.findFirst({
    where: { clientId: client.id, status: 'finalised' },
    orderBy: { version: 'desc' },
  })

  if (!reading) {
    return NextResponse.json({ error: 'not_ready' }, { status: 404 })
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

  // Load interpretations
  const numberKeys = [
    getNumberKey(profile.lifePath),
    getNumberKey(profile.destiny),
    getNumberKey(profile.soul),
    getNumberKey(profile.personality),
    getNumberKey(profile.maturity),
    getNumberKey(profile.birthDay),
    getNumberKey(profile.currentName),
  ]

  const interpRows = await prisma.interpretation.findMany({
    where: { numberKey: { in: numberKeys }, locale: client.preferredLanguage },
  })
  const interpretations = Object.fromEntries(
    interpRows.map((r) => [r.numberKey, JSON.parse(r.baseText)])
  )

  return NextResponse.json({
    client: {
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth,
      preferredLanguage: client.preferredLanguage,
    },
    reading: {
      version: reading.version,
      createdAt: reading.createdAt,
      language: reading.language,
      aiNarrative: reading.aiNarrative,
      editedNarrative: reading.editedNarrative,
    },
    profile,
    forecast: {
      personalYear: forecast.personalYear,
      personalMonth: forecast.personalMonth,
      personalDay: forecast.personalDay,
    },
    interpretations,
    practitioner: {
      name: client.user.name,
      logoUrl: client.user.logoUrl,
      brandingFooter: client.user.brandingFooter,
    },
  })
}

function getNumberKey(result: { value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean; karmicDebtNumber?: number }): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) {
    return `karmic_debt_${result.karmicDebtNumber}`
  }
  if (result.isMasterNumber) {
    return `master_${result.value}`
  }
  return `life_path_${result.value}`
}
