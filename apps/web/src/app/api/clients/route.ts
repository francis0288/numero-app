import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { calculateFullProfile, stripVietnamese } from '@numero-app/core'

const createClientSchema = z.object({
  displayName: z.string().min(1),
  motherName: z.string().optional(),
  dateOfBirth: z.string().min(1),
  preferredLanguage: z.string().default('vi'),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { readings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createClientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const stripped = stripVietnamese(data.displayName)

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      firstName: data.displayName,
      middleName: null,
      lastName: '',
      birthCertName: stripped,
      currentName: stripped,
      dateOfBirth: new Date(data.dateOfBirth),
      preferredLanguage: data.preferredLanguage,
      email: null,
      phone: null,
      notes: data.notes || null,
    },
  })

  const profile = calculateFullProfile({
    birthDate: data.dateOfBirth,
    birthCertName: stripped,
    currentName: stripped,
    motherName: data.motherName ? stripVietnamese(data.motherName) : undefined,
  })

  await prisma.reading.create({
    data: {
      clientId: client.id,
      version: 1,
      language: data.preferredLanguage,
      profileJSON: JSON.stringify(profile),
      status: 'draft',
    },
  })

  return NextResponse.json({ id: client.id }, { status: 201 })
}
