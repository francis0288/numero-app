import { unstable_noStore as noStore } from 'next/cache'
import { prisma } from './prisma'

let cachedUserId: string | null = null

export async function getCurrentUserId(): Promise<string> {
  noStore()
  if (cachedUserId) return cachedUserId
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('No user found in database')
  cachedUserId = user.id
  return user.id
}
