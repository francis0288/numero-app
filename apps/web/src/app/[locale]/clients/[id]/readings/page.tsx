import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NavBar } from '@/components/NavBar'

const LANG_DISPLAY: Record<string, string> = {
  en: '🇬🇧 English',
  zh: '🇨🇳 中文',
  vi: '🇻🇳 Tiếng Việt',
}

const TONE_LABELS: Record<string, string> = {
  warm: '✨ Warm',
  analytical: '📊 Analytical',
  spiritual: '🌙 Spiritual',
  practical: '⚡ Practical',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function ReadingsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(locale === 'en' ? '/login' : `/${locale}/login`)
  }

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!client) notFound()

  const readings = await prisma.reading.findMany({
    where: { clientId: id },
    orderBy: { version: 'desc' },
  })

  const profilePath = locale === 'en' ? `/clients/${id}/profile` : `/${locale}/clients/${id}/profile`
  const readingPath = locale === 'en' ? `/clients/${id}/reading` : `/${locale}/clients/${id}/reading`

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <a href={profilePath} className="text-sm text-[#888888] hover:text-[#7B5EA7] transition-colors">
            ← Back to profile
          </a>
          <h1 className="text-xl font-medium text-[#2C2C2C]">
            {[client.lastName, client.middleName, client.firstName].filter(Boolean).join(' ')} — Reading history
          </h1>
        </div>

        {readings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E0F0] p-8 text-center">
            <p className="text-[#888888] mb-4">No readings yet.</p>
            <a
              href={readingPath}
              className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
            >
              Generate first reading →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {readings.map((r) => {
              const preview = (r.editedNarrative ?? r.aiNarrative ?? '').slice(0, 150)
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E8E0F0] p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#F5F0FB] text-[#7B5EA7] text-xs px-2 py-1 rounded-full font-medium">
                        v{r.version}
                      </span>
                      <span className="bg-[#F5F5F5] text-[#555] text-xs px-2 py-1 rounded-full">
                        {LANG_DISPLAY[r.language] ?? r.language}
                      </span>
                      <span className="text-[#888888] text-xs">
                        {TONE_LABELS[r.tone] ?? r.tone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'finalised' ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-full">
                          Finalised
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-1 rounded-full">
                          Draft
                        </span>
                      )}
                      <span className="text-[#888888] text-xs">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  {preview && (
                    <p className="text-[#888888] text-sm mt-3 leading-relaxed line-clamp-2">
                      {preview}…
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6">
          <a
            href={readingPath}
            className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
          >
            Generate new reading →
          </a>
        </div>
      </main>
    </div>
  )
}
