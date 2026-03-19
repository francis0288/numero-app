import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { logoUrl: string }

  if (!body.logoUrl) {
    return NextResponse.json({ error: 'Missing logoUrl' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { logoUrl: body.logoUrl },
  })

  return NextResponse.json({ logoUrl: user.logoUrl })
}
