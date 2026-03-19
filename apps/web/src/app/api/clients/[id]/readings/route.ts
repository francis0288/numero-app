import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
  })

  if (!client) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const readings = await prisma.reading.findMany({
    where: { clientId: params.id },
    orderBy: { version: 'desc' },
  })

  const items = readings.map((r) => {
    const narrative = r.editedNarrative ?? r.aiNarrative ?? ''
    return {
      id: r.id,
      version: r.version,
      createdAt: r.createdAt,
      language: r.language,
      tone: r.tone,
      status: r.status,
      preview: narrative.slice(0, 120),
    }
  })

  return NextResponse.json({ readings: items })
}
