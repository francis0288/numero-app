import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { stripVietnamese } from '@numero-app/core'

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

  const body = await request.json() as {
    displayName?: string
    dateOfBirth?: string
    preferredLanguage?: string
    notes?: string
  }

  const updateData: Record<string, unknown> = {}

  if (body.displayName !== undefined) {
    const stripped = stripVietnamese(body.displayName)
    updateData.firstName = body.displayName
    updateData.birthCertName = stripped
    updateData.currentName = stripped
  }

  if (body.dateOfBirth !== undefined) {
    updateData.dateOfBirth = new Date(body.dateOfBirth)
  }

  if (body.preferredLanguage !== undefined) {
    updateData.preferredLanguage = body.preferredLanguage
  }

  if (body.notes !== undefined) {
    updateData.notes = body.notes || null
  }

  const updated = await prisma.client.update({
    where: { id: params.id },
    data: updateData,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
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

  // Cascade delete: sessions → readings → client
  await prisma.session.deleteMany({
    where: { reading: { clientId: params.id } },
  })
  await prisma.reading.deleteMany({ where: { clientId: params.id } })
  await prisma.client.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
