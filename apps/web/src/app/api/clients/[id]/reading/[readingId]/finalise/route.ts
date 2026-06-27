import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(
  _req: Request,
  { params }: { params: { id: string; readingId: string } }
) {
  const userId = await getCurrentUserId()

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId },
  })

  if (!client) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const reading = await prisma.reading.update({
    where: { id: params.readingId },
    data: { status: 'finalised' },
  })

  // Private readings never get a share token
  if (reading.isPrivate) {
    return NextResponse.json({ shareToken: null, readingId: params.readingId })
  }

  // Use existing token or generate a new one
  let shareToken = client.shareToken
  if (!shareToken) {
    shareToken = randomBytes(32).toString('hex')
    await prisma.client.update({
      where: { id: params.id },
      data: { shareToken },
    })
  }

  return NextResponse.json({ shareToken, readingId: params.readingId })
}
