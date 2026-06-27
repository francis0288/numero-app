import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getCurrentUserId()

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId },
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
