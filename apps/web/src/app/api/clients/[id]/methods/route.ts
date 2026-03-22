import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID = ['A', 'B'] as const

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  })
  if (!client) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const body = await req.json() as {
    destinyMethod?: string
    soulMethod?: string
    personalityMethod?: string
  }

  const data: Record<string, string> = {}
  if (body.destinyMethod && VALID.includes(body.destinyMethod as typeof VALID[number])) {
    data.destinyMethod = body.destinyMethod
  }
  if (body.soulMethod && VALID.includes(body.soulMethod as typeof VALID[number])) {
    data.soulMethod = body.soulMethod
  }
  if (body.personalityMethod && VALID.includes(body.personalityMethod as typeof VALID[number])) {
    data.personalityMethod = body.personalityMethod
  }

  if (Object.keys(data).length > 0) {
    await prisma.client.update({
      where: { id: params.id },
      data,
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
