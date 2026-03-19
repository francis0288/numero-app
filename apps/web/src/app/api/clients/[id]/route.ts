import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

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
    include: {
      readings: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { readings: true } },
    },
  })

  if (!client) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PUT(
  request: Request,
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

  const body = await request.json()
  const updated = await prisma.client.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(updated)
}
