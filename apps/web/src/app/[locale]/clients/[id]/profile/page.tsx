import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateFullProfile,
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
  calculateWorldYearNumber,
  calculatePyramidPeaks,
  calculatePinnacles,
  getActivePeak,
  stripVietnamese,
  PYTHAGOREAN_MAP,
} from '@numero-app/core'
import type { NumerologyProfile, NumberResult } from '@numero-app/core'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { ShareSection } from '@/components/ShareSection'
import { DeleteClientButton } from '@/components/DeleteClientButton'
import { ProfileMethodSections } from '@/components/ProfileMethodSections'
import { PinnacleSection } from '@/components/PinnacleSection'
import type { BuchananPeakData, PhillipsPeakData } from '@/components/PinnacleSection'
import { BirthChartGrid } from '@/components/BirthChartGrid'
import { formatDateShortVI } from '@/lib/formatDate'

// ─── Helpers ───────────────────────────────────────────────────────────────

function loginPath(locale: string) {
  return locale === 'en' ? '/login' : `/${locale}/login`
}

function getNumberKey(result: NumberResult): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) return `karmic_debt_${result.karmicDebtNumber}`
  if (result.isMasterNumber) return `master_${result.value}`
  return `life_path_${result.value}`
}

function getAge(dob: Date): number {
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  return age
}

function getInitial(client: { firstName: string; lastName?: string | null }) {
  return (client.lastName?.[0] ?? client.firstName[0] ?? '').toUpperCase()
}

function getActiveLetter(group: string, age: number): { letter: string; value: number } {
  const letters = [...group.toUpperCase()].filter((c) => /[A-Z]/.test(c))
  if (!letters.length) return { letter: '—', value: 0 }
  const totalCycle = letters.reduce((s, c) => s + (PYTHAGOREAN_MAP[c] ?? 0), 0)
  if (!totalCycle) return { letter: letters[0], value: 0 }
  const pos = age % totalCycle
  let cum = 0
  for (const letter of letters) {
    const dur = PYTHAGOREAN_MAP[letter] ?? 0
    if (pos < cum + dur) return { letter, value: dur }
    cum += dur
  }
  return { letter: letters[letters.length - 1], value: PYTHAGOREAN_MAP[letters[letters.length - 1]] ?? 0 }
}

function stripNumberResult(r: NumberResult) {
  return { value: r.value, display: r.display, isMasterNumber: r.isMasterNumber, workings: r.workings }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionLabel({ title, style }: { title: string; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
      color: 'var(--color-gold)', textTransform: 'uppercase',
      margin: 0, fontFamily: 'var(--font-ui)', ...style,
    }}>
      {title}
    </p>
  )
}

function WorkingsBlock({ workings }: { workings?: string }) {
  if (!workings) return null
  return (
    <div style={{
      marginTop: 6,
      borderLeft: '2px solid var(--color-gold)',
      backgroundColor: 'var(--gold-bg)',
      borderRadius: '0 6px 6px 0',
      padding: '6px 10px',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-gold)', margin: '0 0 2px', fontFamily: 'var(--font-ui)', letterSpacing: '0.04em' }}>
        Cách tính:
      </p>
      <pre style={{ fontSize: 11, color: 'var(--color-mid)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
        {workings}
      </pre>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

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

  // Forecast
  const today = new Date()
  const personalYear = calculatePersonalYear(birthDateStr, today.getFullYear())
  const worldYear = calculateWorldYearNumber(today.getFullYear())
  const personalMonth = calculatePersonalMonth(personalYear, today.getMonth() + 1)
  const personalDay = calculatePersonalDay(personalMonth, today.getDate())
  const currentMonthNum = today.getMonth() + 1

  const monthStrip = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const pm = calculatePersonalMonth(personalYear, m)
    return { month: m, display: pm.display }
  })

  // Transit / Essence
  const nameParts = {
    lastName: stripVietnamese(client.lastName),
    middleName: client.middleName ? stripVietnamese(client.middleName) : undefined,
    firstName: stripVietnamese(client.firstName),
  }
  const currentAge = getAge(client.dateOfBirth)
  const physicalTransit = getActiveLetter(nameParts.firstName, currentAge)
  const mentalTransit = nameParts.middleName ? getActiveLetter(nameParts.middleName, currentAge) : null
  const spiritualTransit = getActiveLetter(nameParts.lastName, currentAge)

  const essenceSum = physicalTransit.value + (mentalTransit?.value ?? 0) + spiritualTransit.value
  const essenceValue = essenceSum > 0 ? (() => {
    let n = essenceSum
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0)
    }
    return n
  })() : 0

  // Interpretation keys
  const coreEntries: [string, NumberResult][] = [
    ['destiny', profile.destiny.methodA],
    ['soul', profile.soul.methodA],
    ['personality', profile.personality.methodA],
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
  const interpMap = Object.fromEntries(interpretations.map((i) => [i.numberKey, i]))

  const lifePathKey = getNumberKey(profile.lifePath)
  const lifePathContent = interpMap[lifePathKey]
    ? JSON.parse(interpMap[lifePathKey].baseText)
    : null

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

  const fullName = [client.lastName, client.middleName, client.firstName].filter(Boolean).join(' ')

  const transitRows = [
    { label: 'Thể Chất (Tên)', transit: physicalTransit, namePart: nameParts.firstName },
    ...(mentalTransit ? [{ label: 'Tinh Thần (Tên đệm)', transit: mentalTransit, namePart: nameParts.middleName ?? '' }] : []),
    { label: 'Tâm Linh (Họ)', transit: spiritualTransit, namePart: nameParts.lastName },
  ]

  // Pyramid Peaks (David Phillips)
  const pyramidPeaks = calculatePyramidPeaks(
    client.dateOfBirth.getDate(),
    client.dateOfBirth.getMonth() + 1,
    client.dateOfBirth.getFullYear(),
    profile.lifePath.value,
    today.getFullYear()
  )
  const activePyramidPeak = getActivePeak(pyramidPeaks.peaks, currentAge)

  // Buchanan Pinnacles
  const birthYear = client.dateOfBirth.getFullYear()
  const buchananPinnacles = calculatePinnacles(birthDateStr, profile.lifePath, currentAge)
  const buchananPeaks: BuchananPeakData[] = buchananPinnacles.map((p) => ({
    display: p.number.display,
    startAge: p.startAge,
    endAge: p.endAge,
    startYear: birthYear + p.startAge,
    isCurrent: p.isCurrent,
  }))

  // Phillips peaks serialised for client component
  const phillipsPeaks: PhillipsPeakData[] = pyramidPeaks.peaks.map((peak) => ({
    number: peak.number,
    label: peak.label,
    startAge: peak.startAge,
    endAge: peak.endAge,
    startYear: peak.startYear,
    description: peak.description,
    isActive: activePyramidPeak?.startAge === peak.startAge,
  }))

  const initialPinnacleSystem = ((client.pinnacleSystem ?? 'buchanan') as string) as 'buchanan' | 'phillips'

  // Method selections from DB
  const initialMethods = {
    destinyMethod: (client.destinyMethod as 'A' | 'B') ?? 'A',
    soulMethod: (client.soulMethod as 'A' | 'B') ?? 'A',
    personalityMethod: (client.personalityMethod as 'A' | 'B') ?? 'A',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />

      <main style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>

        {/* ── 1. Hero ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, padding: '24px 16px 20px',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            backgroundColor: 'var(--gold-main)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 600, color: 'var(--bg-card)',
          }}>
            {getInitial(client)}
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 400,
            color: 'var(--color-dark)', margin: 0, textAlign: 'center',
          }}>
            {fullName}
          </h1>
          <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: 0, fontFamily: 'var(--font-ui)' }}>
            {formatDateShortVI(client.dateOfBirth)} · {currentAge} tuổi
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <span style={{
              border: '1px solid var(--color-gold)', color: 'var(--color-gold)',
              borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 700,
              fontFamily: 'var(--font-ui)',
            }}>
              VIỆT
            </span>
            <span style={{
              border: '0.5px solid var(--color-border)', color: 'var(--color-mid)',
              borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 700,
              fontFamily: 'var(--font-ui)',
            }}>
              ENG
            </span>
          </div>
        </div>

        {/* ── 2–8. Interactive sections: core rings, secondary grid, detail list, two-method cards ── */}
        <ProfileMethodSections
          clientId={id}
          destiny={{ methodA: stripNumberResult(profile.destiny.methodA), methodB: stripNumberResult(profile.destiny.methodB) }}
          soul={{ methodA: stripNumberResult(profile.soul.methodA), methodB: stripNumberResult(profile.soul.methodB) }}
          personality={{ methodA: stripNumberResult(profile.personality.methodA), methodB: stripNumberResult(profile.personality.methodB) }}
          lifePath={stripNumberResult(profile.lifePath)}
          maturity={stripNumberResult(profile.maturity)}
          birthDay={stripNumberResult(profile.birthDay)}
          lifePathSub={lifePathContent?.overview?.slice(0, 60) ?? 'Mục đích cuộc sống'}
          initialMethods={initialMethods}
        />

        {/* ── 3. Dark forecast card ── */}
        <div style={{
          backgroundColor: 'var(--bg-primary)', borderRadius: 20,
          margin: '0 16px 14px', padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <SectionLabel title="Năm Cá Nhân" style={{ color: 'var(--color-gold)', marginBottom: 6 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 300, color: 'var(--bg-card)', lineHeight: 1, margin: '0 0 4px' }}>
                  {personalYear.display}
                </p>
                <div style={{ opacity: 0.75 }}>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                    Năm Thế Giới
                  </p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, color: 'var(--bg-card)', lineHeight: 1, margin: 0 }}>
                    {worldYear}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-ui)' }}>
                {today.getFullYear()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: 10, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
                Tháng Cá Nhân
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 500, color: 'var(--gold-bright)', margin: 0 }}>
                {personalMonth.display}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
                Ngày: {personalDay.display}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }} className="hide-scrollbar">
            {monthStrip.map(({ month, display }) => {
              const isActive = month === currentMonthNum
              return (
                <div key={month} style={{
                  flexShrink: 0, borderRadius: 20, padding: '5px 9px',
                  backgroundColor: isActive ? 'var(--gold-bright)' : 'var(--bg-secondary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{
                    fontSize: 11, color: isActive ? 'var(--bg-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-ui)', fontWeight: isActive ? 600 : 400,
                  }}>
                    T{month}
                  </span>
                  <span style={{
                    fontSize: 9, color: isActive ? 'var(--bg-primary)' : 'var(--text-muted)',
                    fontFamily: 'Georgia, serif', fontWeight: 500,
                  }}>
                    {display}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 4. Reading CTA ── */}
        <div style={{ padding: '0 16px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href={readingPath}
            style={{
              flex: 1, backgroundColor: 'var(--color-gold)', color: 'var(--bg-card)',
              borderRadius: 12, padding: '11px 16px', fontSize: 14, fontWeight: 600,
              textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--font-ui)',
            }}
          >
            {readingCount === 0 ? 'Tạo Bài Đọc AI →' : 'Xem Bài Đọc →'}
          </a>
          <a
            href={locale === 'en' ? `/clients/${id}/edit` : `/${locale}/clients/${id}/edit`}
            style={{
              border: '0.5px solid var(--color-border)', color: 'var(--color-mid)',
              borderRadius: 12, padding: '11px 16px', fontSize: 14,
              textDecoration: 'none', fontFamily: 'var(--font-ui)',
            }}
          >
            Sửa
          </a>
        </div>

        {/* ── 9. SỐ THÁI ĐỘ + SỐ KẾT NỐI (side by side) ── */}
        <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            backgroundColor: 'var(--color-white)', borderRadius: 16,
            border: '0.5px solid var(--color-border)', padding: '16px',
          }}>
            <SectionLabel title="Số Thái Độ" style={{ marginBottom: 10 }} />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: 'var(--color-dark)', margin: '0 0 6px', lineHeight: 1 }}>
              {profile.attitude.display}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '0 0 8px', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
              Thái độ & ấn tượng đầu tiên
            </p>
            <WorkingsBlock workings={profile.attitude.workings} />
          </div>
          <div style={{
            backgroundColor: 'var(--color-white)', borderRadius: 16,
            border: '0.5px solid var(--color-border)', padding: '16px',
          }}>
            <SectionLabel title="Số Kết Nối" style={{ marginBottom: 10 }} />
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: 'var(--color-dark)', margin: '0 0 6px', lineHeight: 1 }}>
              {profile.bridge.display}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '0 0 8px', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
              Kết nối Đường Đời & Vận Mệnh
            </p>
            <WorkingsBlock workings={profile.bridge.workings} />
          </div>
        </div>

        {/* ── 10. SỐ TÊN MẸ (if exists) ── */}
        {profile.motherName && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{
              backgroundColor: 'var(--color-white)', borderRadius: 16,
              border: '0.5px solid var(--color-border)', padding: '16px',
            }}>
              <SectionLabel title="Số Tên Mẹ" style={{ marginBottom: 10 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: 'var(--color-dark)', margin: 0, lineHeight: 1, flexShrink: 0 }}>
                  {profile.motherName.display}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: 0, lineHeight: 1.4, fontFamily: 'var(--font-ui)', flex: 1 }}>
                  Ảnh hưởng của mẹ lên biểu đồ số học
                </p>
              </div>
              <WorkingsBlock workings={profile.motherName.workings} />
            </div>
          </div>
        )}

        {/* ── 11. BIỂU ĐỒ NGÀY SINH ── */}
        <BirthChartGrid
          birthDay={client.dateOfBirth.getDate()}
          birthMonth={client.dateOfBirth.getMonth() + 1}
          birthYear={client.dateOfBirth.getFullYear()}
          firstName={client.firstName}
          middleName={client.middleName ?? ''}
          lastName={client.lastName}
          isolatedDigits={profile.isolationNumbers}
        />

        {/* ── 12. SỐ TINH CHẤT ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            backgroundColor: 'var(--color-white)', borderRadius: 16,
            border: '0.5px solid var(--color-border)', padding: 16,
          }}>
            <SectionLabel title={`Số Tinh Chất — Tuổi ${currentAge}`} style={{ marginBottom: 12 }} />
            {transitRows.map(({ label, transit, namePart }, idx) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: idx < transitRows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <span style={{ fontSize: 11, color: 'var(--color-mid)', width: 110, fontFamily: 'var(--font-ui)', lineHeight: 1.3 }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 500, color: 'var(--color-dark)' }}>
                  {transit.letter} · {transit.value}
                </span>
                <span style={{
                  fontSize: 10, color: 'var(--color-gold)',
                  backgroundColor: 'var(--gold-bg)', borderRadius: 10,
                  padding: '2px 8px', fontFamily: 'var(--font-ui)', fontWeight: 500,
                }}>
                  {namePart}
                </span>
              </div>
            ))}
            <div style={{
              marginTop: 10, backgroundColor: 'var(--gold-bg)',
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-dark)', fontFamily: 'var(--font-ui)' }}>
                SỐ TINH CHẤT
              </span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: 'var(--color-gold)' }}>
                {essenceValue || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 12b. SỐ ĐỈNH — Buchanan + Phillips side by side ── */}
        <PinnacleSection
          clientId={id}
          buchananPeaks={buchananPeaks}
          phillipsPeaks={phillipsPeaks}
          phillipsBaseNumbers={pyramidPeaks.baseNumbers}
          initialSystem={initialPinnacleSystem}
        />

        {/* ── 13. BÀI HỌC NHÂN QUẢ ── */}
        {profile.karmicLessons.length > 0 && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{
              backgroundColor: 'var(--color-white)', borderRadius: 16,
              border: '0.5px solid var(--color-border)', padding: 16,
            }}>
              <SectionLabel title="Bài Học Nhân Quả" style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {profile.karmicLessons.map((num) => {
                  const kKey = `karmic_lesson_${num}`
                  const kInterp = interpMap[kKey]
                  const kContent = kInterp ? JSON.parse(kInterp.baseText) : null
                  const detailPath = locale === 'en'
                    ? `/clients/${id}/numbers/${kKey}`
                    : `/${locale}/clients/${id}/numbers/${kKey}`
                  return (
                    <a key={num} href={detailPath} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        backgroundColor: 'var(--gold-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: 'var(--color-gold)',
                      }}>
                        {num}
                      </div>
                      {kContent?.title && (
                        <p style={{ fontSize: 9, color: 'var(--color-mid)', textAlign: 'center', maxWidth: 60, margin: 0, fontFamily: 'var(--font-ui)', lineHeight: 1.3 }}>
                          {kContent.title.split(' — ')[0].replace('Karmic Lesson ', '')}
                        </p>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Share ── */}
        {hasFinalised && shareUrl && (
          <div style={{ padding: '0 16px 14px' }}>
            <ShareSection shareUrl={shareUrl} clientId={id} locale={locale} />
          </div>
        )}

        {/* ── 14. Footer actions ── */}
        <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={dashboardPath} style={{ fontSize: 13, color: 'var(--color-mid)', textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>
            ← Quay lại danh sách
          </a>
          <DeleteClientButton
            clientId={id}
            clientName={fullName}
            locale={locale}
          />
        </div>

      </main>

      {/* ── 15. Bottom navigation bar ── */}
      <BottomNav locale={locale} clientId={id} />
    </div>
  )
}
