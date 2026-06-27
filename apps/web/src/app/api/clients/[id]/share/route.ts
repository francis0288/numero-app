import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(
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

  const newToken = randomUUID()

  await prisma.client.update({
    where: { id: params.id },
    data: { shareToken: newToken },
  })

  return NextResponse.json({ success: true, shareToken: newToken })
}
