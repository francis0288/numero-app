import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NavBar } from '@/components/NavBar'
import { ClientList } from './ClientList'

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

  const newClientPath = locale === 'en' ? '/clients/new' : `/${locale}/clients/new`

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-[#2C2C2C]">My Clients</h1>
            <span className="bg-[#F5F0FB] text-[#7B5EA7] text-sm font-medium rounded-full px-3 py-0.5">
              {clients.length}
            </span>
          </div>
          <a
            href={newClientPath}
            className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6A4F96] transition-colors"
          >
            + Add new client
          </a>
        </div>

        <ClientList clients={clients} locale={locale} />
      </main>
    </div>
  )
}
