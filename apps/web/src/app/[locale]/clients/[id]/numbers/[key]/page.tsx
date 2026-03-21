import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NavBar } from '@/components/NavBar'
import { EngToggle } from '@/components/EngToggle'

function loginPath(locale: string) {
  return locale === 'en' ? '/login' : `/${locale}/login`
}

interface InterpContent {
  title: string
  keywords: string[]
  overview: string
  strengths: string[]
  challenges: string[]
  lifeLesson: string
  compatibleNumbers: number[]
  careerSuggestions: string[]
  astrological: string
}

export default async function NumberDetailPage({
  params: { locale, id, key },
}: {
  params: { locale: string; id: string; key: string }
}): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(loginPath(locale))

  // Verify client ownership
  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!client) notFound()

  const interpretation = await prisma.interpretation.findFirst({
    where: { numberKey: key, locale: client.preferredLanguage },
  })
  if (!interpretation) notFound()

  const content: InterpContent = JSON.parse(interpretation.baseText)

  // Extract display number from key (e.g. "life_path_7" → "7", "master_11" → "11")
  const displayNum = key.split('_').at(-1) ?? ''

  const profilePath =
    locale === 'en'
      ? `/clients/${id}/profile`
      : `/${locale}/clients/${id}/profile`

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />

      <main className="max-w-[700px] mx-auto px-4 py-8 space-y-6">
        {/* Back link + ENG toggle */}
        <div className="flex items-center justify-between">
          <a
            href={profilePath}
            className="text-sm text-[#888888] hover:text-[#7B5EA7] transition-colors"
          >
            {locale === 'vi' ? '← Quay lại hồ sơ' : '← Back to profile'}
          </a>
          {locale === 'vi' && <EngToggle />}
        </div>

        {/* Header card */}
        <div className="bg-[#7B5EA7] text-white rounded-2xl p-8">
          <div className="flex items-center gap-6">
            <span className="text-[72px] font-bold text-[#D4AC6E] leading-none">
              {displayNum}
            </span>
            <div>
              <p className="text-white/70 text-sm uppercase tracking-wide mb-1">
                {interpretation.category.replace(/_/g, ' ')}
              </p>
              <h1 className="text-2xl font-medium text-white">{content.title}</h1>
            </div>
          </div>
        </div>

        {/* Keywords */}
        {content.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.keywords.map((kw) => (
              <span
                key={kw}
                className="bg-[#F5F0FB] text-[#7B5EA7] rounded-full px-3 py-1 text-sm"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Overview */}
        {content.overview && (
          <div className="bg-white rounded-2xl border border-[#E8E0F0] p-6">
            <h2 className="text-base font-medium text-[#2C2C2C] mb-1">{locale === 'vi' ? 'Tổng quan' : 'Overview'}</h2>
            {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-2">Overview</p>}
            <p className="text-[#2C2C2C] text-sm leading-relaxed">{content.overview}</p>
          </div>
        )}

        {/* Strengths + Challenges */}
        {(content.strengths?.length > 0 || content.challenges?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-[#E8E0F0] p-5">
              <h2 className="text-base font-medium text-[#2C2C2C] mb-1">{locale === 'vi' ? 'Điểm mạnh' : 'Strengths'}</h2>
              {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-2">Strengths</p>}
              <ul className="space-y-2">
                {content.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <span className="text-[#1E8449] font-bold shrink-0 mt-0.5">✓</span>
                    <span className="text-[#2C2C2C]">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="bg-white rounded-2xl border border-[#E8E0F0] p-5">
              <h2 className="text-base font-medium text-[#2C2C2C] mb-1">{locale === 'vi' ? 'Thách thức' : 'Challenges'}</h2>
              {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-2">Challenges</p>}
              <ul className="space-y-2">
                {content.challenges.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm">
                    <span className="text-[#888888] shrink-0 mt-0.5">○</span>
                    <span className="text-[#888888]">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Life lesson */}
        {content.lifeLesson && (
          <div className="bg-[#FFFBF0] border-l-4 border-[#D4AC6E] px-5 py-4 rounded-r-xl">
            <h2 className="text-sm font-medium text-[#2C2C2C] mb-1">{locale === 'vi' ? 'Bài học cuộc đời' : 'Life Lesson'}</h2>
            {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-1">Life Lesson</p>}
            <p className="text-[#2C2C2C] text-sm leading-relaxed italic">{content.lifeLesson}</p>
          </div>
        )}

        {/* Compatible numbers */}
        {content.compatibleNumbers?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E0F0] p-5">
            <h2 className="text-base font-medium text-[#2C2C2C] mb-1">{locale === 'vi' ? 'Số tương hợp' : 'Compatible Numbers'}</h2>
            {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-2">Compatible Numbers</p>}
            <div className="flex gap-2">
              {content.compatibleNumbers.map((n) => (
                <span
                  key={n}
                  className="w-10 h-10 rounded-xl bg-[#F5F0FB] flex items-center justify-center text-[#7B5EA7] font-bold text-lg"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Career + Astro */}
        {(content.careerSuggestions?.length > 0 || content.astrological) && (
          <div className="bg-white rounded-2xl border border-[#E8E0F0] p-5 space-y-3">
            {content.careerSuggestions?.length > 0 && (
              <div>
                <h2 className="text-base font-medium text-[#2C2C2C] mb-0.5">{locale === 'vi' ? 'Gợi ý nghề nghiệp' : 'Career Suggestions'}</h2>
                {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-1">Career Suggestions</p>}
                <p className="text-sm text-[#888888]">{content.careerSuggestions.join(', ')}</p>
              </div>
            )}
            {content.astrological && (
              <div>
                <h2 className="text-base font-medium text-[#2C2C2C] mb-0.5">{locale === 'vi' ? 'Ảnh hưởng chiêm tinh' : 'Astrological Influence'}</h2>
                {locale === 'vi' && <p className="eng-sub text-xs text-[#888888] italic mb-1">Astrological Influence</p>}
                <p className="text-sm text-[#888888] italic">{content.astrological}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
