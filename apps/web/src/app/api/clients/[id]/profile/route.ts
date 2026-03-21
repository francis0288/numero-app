import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { calculateFullProfile, calculateToday } from '@numero-app/core'
import type { NumerologyProfile, NumberResult } from '@numero-app/core'

function getNumberKey(result: NumberResult): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) {
    return `karmic_debt_${result.karmicDebtNumber}`
  }
  if (result.isMasterNumber) {
    return `master_${result.value}`
  }
  return `life_path_${result.value}`
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { readings: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })

  if (!client) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]

  let profile: NumerologyProfile
  if (client.readings[0]?.profileJSON) {
    profile = JSON.parse(client.readings[0].profileJSON) as NumerologyProfile
  } else {
    profile = calculateFullProfile({
      birthDate: birthDateStr,
      birthCertName: client.birthCertName,
      currentName: client.currentName,
    })
  }

  const numberKeys = [
    getNumberKey(profile.lifePath),
    getNumberKey(profile.destiny.methodA),
    getNumberKey(profile.soul.methodA),
    getNumberKey(profile.personality.methodA),
    getNumberKey(profile.maturity),
    getNumberKey(profile.birthDay),
    getNumberKey(profile.currentName),
    ...profile.karmicLessons.map((n) => `karmic_lesson_${n}`),
  ]

  const interpretations = await prisma.interpretation.findMany({
    where: { numberKey: { in: numberKeys }, locale: client.preferredLanguage },
  })

  const interpMap = Object.fromEntries(interpretations.map((i) => [i.numberKey, i]))

  const forecast = calculateToday(birthDateStr)

  return NextResponse.json({ client, profile, interpretations: interpMap, forecast })
}
