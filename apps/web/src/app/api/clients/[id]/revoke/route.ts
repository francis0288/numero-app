import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

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

  // Set shareToken to a revoked marker (prefixed with 'revoked_')
  await prisma.client.update({
    where: { id: params.id },
    data: { shareToken: `revoked_${Date.now()}` },
  })

  return NextResponse.json({ success: true, revoked: true })
}
