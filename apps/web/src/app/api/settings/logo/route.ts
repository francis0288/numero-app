import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const userId = await getCurrentUserId()

  const body = await req.json() as { logoUrl: string }

  if (!body.logoUrl) {
    return NextResponse.json({ error: 'Missing logoUrl' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { logoUrl: body.logoUrl },
  })

  return NextResponse.json({ logoUrl: user.logoUrl })
}
