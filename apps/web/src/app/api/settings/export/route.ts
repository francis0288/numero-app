import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: {
      readings: { orderBy: { version: 'desc' }, take: 1 },
      _count: { select: { readings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'Client Name',
    'Date of Birth',
    'Birth Cert Name',
    'Current Name',
    'Language',
    'Readings',
    'Last Reading',
    'Added',
  ]

  const rows = clients.map((c) => {
    const lastReading = c.readings[0]
    return [
      `${c.firstName}${c.middleName ? ` ${c.middleName}` : ''} ${c.lastName}`,
      c.dateOfBirth.toISOString().split('T')[0],
      c.birthCertName,
      c.currentName,
      c.preferredLanguage,
      c._count.readings,
      lastReading ? lastReading.createdAt.toISOString().split('T')[0] : '',
      c.createdAt.toISOString().split('T')[0],
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clients.csv"',
    },
  })
}
