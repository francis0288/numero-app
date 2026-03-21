import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateFullProfile, calculatePersonalYear, calculatePersonalMonth, calculatePersonalDay } from '@numero-app/core'
import type { NumerologyProfile, NumberResult } from '@numero-app/core'
import { NavBar } from '@/components/NavBar'
import { ShareSection } from '@/components/ShareSection'

// ─── Helpers ────────────────────────────────────────────────────────────────

function loginPath(locale: string) {
  return locale === 'en' ? '/login' : `/${locale}/login`
}

function getNumberKey(result: NumberResult): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) {
    return `karmic_debt_${result.karmicDebtNumber}`
  }
  if (result.isMasterNumber) {
    return `master_${result.value}`
  }
  return `life_path_${result.value}`
}

function formatDOB(date: Date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getAge(dob: Date) {
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  return age
}

function todayFormatted() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const LANG_LABELS: Record<string, string> = { en: 'EN', vi: 'Việt' }

// ─── Sub-components ──────────────────────────────────────────────────────────

function NumberCard({
  label,
  result,
  interp,
  numberKey,
  locale,
  clientId,
}: {
  label: string
  result: NumberResult
  interp: { baseText: string } | undefined
  numberKey: string
  locale: string
  clientId: string
}) {
  const content = interp ? JSON.parse(interp.baseText) : null
  const detailPath =
    locale === 'en'
      ? `/clients/${clientId}/numbers/${numberKey}`
      : `/${locale}/clients/${clientId}/numbers/${numberKey}`

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0F0] p-5">
      <p className="text-xs text-[#888888] font-medium uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold text-[#7B5EA7]">{result.display}</span>
        {result.isMasterNumber && (
          <span className="bg-[#7B5EA7] text-white text-xs rounded-full px-2 py-0.5 font-medium">
            Master
          </span>
        )}
        {result.isKarmicDebt && (
          <span className="bg-[#D4AC6E] text-white text-xs rounded-full px-2 py-0.5 font-medium">
            Karmic Debt
          </span>
        )}
      </div>
      {content?.title && (
        <p className="text-sm text-[#2C2C2C] mb-3">{content.title}</p>
      )}
      <a href={detailPath} className="text-sm text-[#7B5EA7] hover:underline">
        {locale === 'vi' ? 'Xem ý nghĩa →' : 'View meaning →'}
      </a>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProfilePage({
  params: { locale, id },
}: {
  params: { locale: string; id: string }
}): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(loginPath(locale))

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    include: { readings: { orderBy: { version: 'desc' }, take: 1 } },
  })
  if (!client) notFound()

  const readingCount = await prisma.reading.count({ where: { clientId: id } })

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]

  // Resolve profile
  let profile: NumerologyProfile
  if (client.readings[0]?.profileJSON) {
    profile = JSON.parse(client.readings[0].profileJSON) as NumerologyProfile
  } else {
    profile = calculateFullProfile({
      birthDate: birthDateStr,
      birthCertName: client.birthCertName,
      currentName: client.currentName,
    })
  }

  const CORE_LABELS: Record<string, string> = locale === 'vi' ? {
    destiny: 'Số Định Mệnh',
    soul: 'Số Linh Hồn',
    personality: 'Số Nhân Cách',
    maturity: 'Số Trưởng Thành',
    birthDay: 'Số Ngày Sinh',
    currentName: 'Số Tên Hiện Tại',
  } : {
    destiny: 'Destiny Number',
    soul: 'Soul Number',
    personality: 'Personality Number',
    maturity: 'Maturity Number',
    birthDay: 'Birthday Number',
    currentName: 'Current Name Number',
  }

  // Collect all number keys to fetch
  const coreEntries: [string, NumberResult][] = [
    ['destiny', profile.destiny],
    ['soul', profile.soul],
    ['personality', profile.personality],
    ['maturity', profile.maturity],
    ['birthDay', profile.birthDay],
    ['currentName', profile.currentName],
  ]

  const numberKeys = [
    getNumberKey(profile.lifePath),
    ...coreEntries.map(([, r]) => getNumberKey(r)),
    ...profile.karmicLessons.map((n) => `karmic_lesson_${n}`),
  ]

  const interpretations = await prisma.interpretation.findMany({
    where: { numberKey: { in: numberKeys }, locale: client.preferredLanguage },
  })
  const interpMap = Object.fromEntries(interpretations.map((i: typeof interpretations[number]) => [i.numberKey, i]))

  const today = new Date()
  const personalYear = calculatePersonalYear(birthDateStr, today.getFullYear())
  const personalMonth = calculatePersonalMonth(personalYear, today.getMonth() + 1)
  const personalDay = calculatePersonalDay(personalMonth, today.getDate())
  const forecast = { personalYear, personalMonth, personalDay }

  const lifePathKey = getNumberKey(profile.lifePath)
  const lifePathInterp = interpMap[lifePathKey]
  const lifePathContent = lifePathInterp ? JSON.parse(lifePathInterp.baseText) : null

  const finalisedReading = await prisma.reading.findFirst({
    where: { clientId: id, status: 'finalised' },
    orderBy: { version: 'desc' },
    select: { id: true },
  })
  const hasFinalised = !!finalisedReading
  const shareUrl = hasFinalised
    ? `${process.env.NEXTAUTH_URL ?? 'http://localhost:3001'}/report/${client.shareToken}`
    : null

  const dashboardPath = locale === 'en' ? '/dashboard' : `/${locale}/dashboard`
  const readingPath = locale === 'en' ? `/clients/${id}/reading` : `/${locale}/clients/${id}/reading`
  const readingsPath = locale === 'en' ? `/clients/${id}/readings` : `/${locale}/clients/${id}/readings`
  const latestReading = client.readings[0] ?? null
  const lifePathDetailPath =
    locale === 'en'
      ? `/clients/${id}/numbers/${lifePathKey}`
      : `/${locale}/clients/${id}/numbers/${lifePathKey}`

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />

      <main className="max-w-[900px] mx-auto px-4 py-8 space-y-6">

        {/* ── Client header ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium text-[#2C2C2C]">
                {client.firstName} {client.middleName ? `${client.middleName} ` : ''}{client.lastName}
              </h1>
              <p className="text-[#888888] text-sm mt-1">
                {formatDOB(client.dateOfBirth)} ({locale === 'vi' ? 'tuổi' : 'age'} {getAge(client.dateOfBirth)})
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[#F5F0FB] text-[#7B5EA7] text-xs rounded-full px-3 py-0.5 font-medium">
                  {LANG_LABELS[client.preferredLanguage]}
                </span>
                <a
                  href={locale === 'en' ? `/clients/${id}/edit` : `/${locale}/clients/${id}/edit`}
                  className="text-xs text-[#888888] hover:text-[#7B5EA7] transition-colors"
                >
                  {locale === 'vi' ? 'Chỉnh sửa khách hàng' : 'Edit client'}
                </a>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <a
                href={readingPath}
                className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
              >
                {readingCount === 0
                  ? (locale === 'vi' ? 'Tạo bài đọc AI →' : 'Generate AI reading →')
                  : (locale === 'vi' ? 'Xem bài đọc →' : 'View reading →')}
              </a>
              {latestReading && (
                <p className="text-xs text-[#888888]">
                  v{latestReading.version} · {latestReading.status}
                </p>
              )}
              {readingCount > 1 && (
                <a
                  href={readingsPath}
                  className="text-xs text-[#7B5EA7] hover:underline"
                >
                  {locale === 'vi' ? `Lịch sử bài đọc (${readingCount})` : `Reading history (${readingCount})`}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Life Path hero ── */}
        <div className="bg-[#7B5EA7] text-white rounded-2xl p-8">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wide mb-2">
            {locale === 'vi' ? 'Số Đường Đời' : 'Life Path Number'}
          </p>
          <div className="flex items-center gap-5 mb-4">
            <span className="text-[72px] font-bold text-[#D4AC6E] leading-none">
              {profile.lifePath.display}
            </span>
            <div>
              {lifePathContent?.title && (
                <h2 className="text-xl font-medium text-white">{lifePathContent.title}</h2>
              )}
              {lifePathContent?.overview && (
                <p className="text-white/80 text-sm mt-1 line-clamp-2">{lifePathContent.overview}</p>
              )}
            </div>
          </div>
          <a
            href={lifePathDetailPath}
            className="text-[#D4AC6E] text-sm hover:underline"
          >
            {locale === 'vi' ? 'Xem ý nghĩa đầy đủ →' : 'View full meaning →'}
          </a>
        </div>

        {/* ── Core numbers grid ── */}
        <div>
          <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">{locale === 'vi' ? 'Số cốt lõi' : 'Core Numbers'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreEntries.map(([fieldKey, result]) => {
              const nKey = getNumberKey(result)
              return (
                <NumberCard
                  key={fieldKey}
                  label={CORE_LABELS[fieldKey]}
                  result={result}
                  interp={interpMap[nKey]}
                  numberKey={nKey}
                  locale={locale}
                  clientId={id}
                />
              )
            })}
          </div>
        </div>

        {/* ── Today's forecast strip ── */}
        <div className="bg-[#F5F0FB] rounded-2xl p-5">
          <h2 className="text-base font-medium text-[#2C2C2C] mb-4">
            {locale === 'vi' ? 'Hôm nay —' : 'Today —'} {todayFormatted()}
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: locale === 'vi' ? 'Năm Cá Nhân' : 'Personal Year', result: forecast.personalYear },
              { label: locale === 'vi' ? 'Tháng Cá Nhân' : 'Personal Month', result: forecast.personalMonth },
              { label: locale === 'vi' ? 'Ngày Cá Nhân' : 'Personal Day', result: forecast.personalDay },
            ].map(({ label, result }) => (
              <div
                key={label}
                className="bg-white border border-[#E8E0F0] rounded-xl px-4 py-2.5"
              >
                <span className="text-xs text-[#888888]">{label}: </span>
                <span className="text-sm font-medium text-[#7B5EA7]">{result.display}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Karmic Lessons ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-medium text-[#2C2C2C]">{locale === 'vi' ? 'Bài Học Nghiệp' : 'Karmic Lessons'}</h2>
            <div className="group relative">
              <span className="w-4 h-4 rounded-full bg-[#E8E0F0] text-[#888888] text-xs flex items-center justify-center cursor-help">
                i
              </span>
              <div className="absolute left-6 top-0 hidden group-hover:block z-10 bg-[#2C2C2C] text-white text-xs rounded-lg px-3 py-2 w-48">
                {locale === 'vi' ? 'Số vắng mặt trong tên khai sinh' : 'Numbers absent from the birth certificate name'}
              </div>
            </div>
          </div>

          {profile.karmicLessons.length === 0 ? (
            <p className="text-[#888888] text-sm">
              {locale === 'vi' ? 'Không có bài học nghiệp — tất cả số 1–9 đều có mặt ✓' : 'No karmic lessons — all numbers 1–9 are present ✓'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {profile.karmicLessons.map((num) => {
                const kKey = `karmic_lesson_${num}`
                const kInterp = interpMap[kKey]
                const kContent = kInterp ? JSON.parse(kInterp.baseText) : null
                const detailPath =
                  locale === 'en'
                    ? `/clients/${id}/numbers/${kKey}`
                    : `/${locale}/clients/${id}/numbers/${kKey}`
                return (
                  <a
                    key={num}
                    href={detailPath}
                    className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F5F0FB] flex items-center justify-center text-[#7B5EA7] text-xl font-bold">
                      {num}
                    </div>
                    {kContent?.title && (
                      <p className="text-xs text-[#2C2C2C] text-center max-w-[80px]">
                        {kContent.title.replace('Karmic Lesson ', '').split(' — ')[0]}
                      </p>
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Share report ── */}
        {hasFinalised && shareUrl && (
          <ShareSection
            shareUrl={shareUrl}
            clientId={id}
            locale={locale}
          />
        )}

        {/* Back link */}
        <div>
          <a href={dashboardPath} className="text-sm text-[#888888] hover:text-[#7B5EA7] transition-colors">
            {locale === 'vi' ? '← Quay lại danh sách' : '← Back to clients'}
          </a>
        </div>
      </main>
    </div>
  )
}
