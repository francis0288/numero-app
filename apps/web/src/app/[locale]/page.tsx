import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function LocaleRootPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    redirect(locale === 'en' ? '/dashboard' : `/${locale}/dashboard`)
  } else {
    redirect(locale === 'en' ? '/login' : `/${locale}/login`)
  }
}
