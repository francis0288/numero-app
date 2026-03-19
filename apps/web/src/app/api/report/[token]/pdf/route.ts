import { prisma } from '@/lib/prisma'
import {
  calculateFullForecast,
  calculateFullProfile,
} from '@numero-app/core'
import type { NumerologyProfile } from '@numero-app/core'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReadingPDF } from '@/components/ReadingPDF'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getNumberKey(result: { value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean; karmicDebtNumber?: number }): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) return `karmic_debt_${result.karmicDebtNumber}`
  if (result.isMasterNumber) return `master_${result.value}`
  return `life_path_${result.value}`
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const client = await prisma.client.findUnique({
    where: { shareToken: params.token },
    include: { user: true },
  })

  if (!client) {
    return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 })
  }

  const reading = await prisma.reading.findFirst({
    where: { clientId: client.id, status: 'finalised' },
    orderBy: { version: 'desc' },
  })

  if (!reading) {
    return new Response(JSON.stringify({ error: 'not_ready' }), { status: 404 })
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
    interpRows.map((r) => [r.numberKey, JSON.parse(r.baseText) as { title?: string; overview?: string }])
  )

  try {
    const buffer = await renderToBuffer(
      React.createElement(ReadingPDF, {
        client: {
          firstName: client.firstName,
          lastName: client.lastName,
          dateOfBirth: client.dateOfBirth,
        },
        reading: {
          createdAt: reading.createdAt,
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
    return Response.json(
      { error: 'PDF generation failed', detail: String(err) },
      { status: 500 }
    )
  }
}
