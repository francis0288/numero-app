import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePersonalYear, calculateWorldYearNumber } from '@numero-app/core'
import { getInterpretation } from '@/lib/numerology/getInterpretation'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { CyclesScreen } from '@/components/CyclesScreen'

function loginPath(locale: string) {
  return locale === 'en' ? '/login' : `/${locale}/login`
}

export interface YearPoint {
  year: number
  personalYear: number
  personalYearDisplay: string
  worldYear: number
  worldYearDisplay: string
  isCurrent: boolean
}

export default async function CyclesPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  const { locale, id } = params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(loginPath(locale))

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
    },
  })
  if (!client) notFound()

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]
  const today = new Date()
  const currentYear = today.getFullYear()

  // Build 5-year data (currentYear to +4)
  const yearPoints: YearPoint[] = []
  for (let i = 0; i < 5; i++) {
    const year = currentYear + i
    const py = calculatePersonalYear(birthDateStr, year)
    const wy = calculateWorldYearNumber(year)
    yearPoints.push({
      year,
      personalYear: py.value,
      personalYearDisplay: py.display,
      worldYear: wy,
      worldYearDisplay: String(wy),
      isCurrent: i === 0,
    })
  }

  // Fetch MB text for current personal year
  const currentPY = yearPoints[0]
  const mbInterp = await getInterpretation(currentPY.personalYearDisplay, 'personal_year')

  // Birth parts for calculation display
  const dob = client.dateOfBirth
  const birthDay = dob.getUTCDate()
  const birthMonth = dob.getUTCMonth() + 1

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />
      <main style={{ paddingTop: 56, paddingBottom: 88 }}>
        <CyclesScreen
          clientName={client.firstName}
          birthDay={birthDay}
          birthMonth={birthMonth}
          yearPoints={yearPoints}
          currentPersonalYearDisplay={currentPY.personalYearDisplay}
          mbText={mbInterp?.textEn ?? null}
        />
      </main>
      <BottomNav locale={locale} clientId={id} />
    </div>
  )
}
