import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const userId = await getCurrentUserId()

  const user = await prisma.user.findUnique({ where: { id: userId } })
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
  const userId = await getCurrentUserId()

  const body = await req.json() as { name?: string; brandingFooter?: string; phone?: string; brandingEmail?: string }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.brandingFooter !== undefined && { brandingFooter: body.brandingFooter }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.brandingEmail !== undefined && { brandingEmail: body.brandingEmail }),
    },
  })

  return NextResponse.json({ name: user.name, brandingFooter: user.brandingFooter, phone: user.phone, brandingEmail: user.brandingEmail })
}
