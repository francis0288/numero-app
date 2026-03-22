import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NavBar } from '@/components/NavBar'
import { ClientList } from './ClientList'
import { calculateFullProfile, calculatePersonalYear } from '@numero-app/core'

function loginPath(locale: string) {
  return locale === 'en' ? '/login' : `/${locale}/login`
}

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(loginPath(locale))

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { readings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const currentYear = new Date().getFullYear()

  const enrichedClients = clients.map((client, index) => {
    try {
      const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]
      const profile = calculateFullProfile({
        birthDate: birthDateStr,
        birthCertName: client.birthCertName,
        currentName: client.currentName,
      })
      const personalYear = calculatePersonalYear(birthDateStr, currentYear)
      return {
        ...client,
        lifePathDisplay: profile.lifePath.display,
        destinyDisplay: profile.destiny.methodA.display,
        personalYearDisplay: personalYear.display,
        personalYearValue: personalYear.value,
        colorIndex: index % 5,
      }
    } catch {
      return {
        ...client,
        lifePathDisplay: '?',
        destinyDisplay: '?',
        personalYearDisplay: '?',
        personalYearValue: 1,
        colorIndex: index % 5,
      }
    }
  })

  const newClientPath = locale === 'en' ? '/clients/new' : `/${locale}/clients/new`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 400, color: 'var(--color-dark)', margin: 0, lineHeight: 1.2 }}>
              Khách Hàng
            </h1>
            <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '3px 0 0', fontFamily: 'var(--font-ui)' }}>
              {clients.length} hồ sơ
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a
              href={newClientPath}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--color-gold)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 300,
                textDecoration: 'none',
                lineHeight: 1,
              }}
              title="Thêm khách hàng"
            >
              +
            </a>
          </div>
        </div>

        <ClientList clients={enrichedClients} locale={locale} newClientPath={newClientPath} />
      </main>
    </div>
  )
}
