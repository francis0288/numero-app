import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    name: user.name,
    email: user.email,
    logoUrl: user.logoUrl,
    brandingFooter: user.brandingFooter,
    phone: user.phone,
    brandingEmail: user.brandingEmail,
  })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { name?: string; brandingFooter?: string; phone?: string; brandingEmail?: string }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.brandingFooter !== undefined && { brandingFooter: body.brandingFooter }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.brandingEmail !== undefined && { brandingEmail: body.brandingEmail }),
    },
  })

  return NextResponse.json({ name: user.name, brandingFooter: user.brandingFooter, phone: user.phone, brandingEmail: user.brandingEmail })
}
