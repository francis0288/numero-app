import { prisma } from './prisma'

let cachedUserId: string | null = null

export async function getCurrentUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('No user found in database')
  cachedUserId = user.id
  return user.id
}
