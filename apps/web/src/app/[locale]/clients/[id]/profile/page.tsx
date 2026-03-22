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
  stripVietnamese,
  PYTHAGOREAN_MAP,
} from '@numero-app/core'
import type { NumerologyProfile, NumberResult } from '@numero-app/core'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { ShareSection } from '@/components/ShareSection'
import { DeleteClientButton } from '@/components/DeleteClientButton'
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

function ProgressRing({ val, display, isMaster }: { val: number; display: string; isMaster: boolean }) {
  const capped = Math.min(val, 9)
  const dasharray = capped > 0 ? `${(capped / 9) * 175.9} 175.9` : '0 175.9'
  return (
    <svg viewBox="0 0 72 72" width="72" height="72">
      <circle cx="36" cy="36" r="28" stroke="rgba(196,146,42,0.12)" strokeWidth="5" fill="none" />
      {capped > 0 && (
        <circle
          cx="36" cy="36" r="28"
          stroke="#C4922A" strokeWidth="5" fill="none"
          strokeLinecap="round"
          strokeDasharray={dasharray}
          transform="rotate(-90 36 36)"
        />
      )}
      <text
        x="36" y="41" textAnchor="middle"
        fontSize={isMaster ? '14' : '20'} fontWeight="500"
        fill="#1C1A14" fontFamily="Georgia,serif"
      >
        {val > 0 ? display : '—'}
      </text>
    </svg>
  )
}

function WorkingsBlock({ workings }: { workings?: string }) {
  if (!workings) return null
  return (
    <div style={{
      marginTop: 6,
      borderLeft: '2px solid var(--color-gold)',
      backgroundColor: 'rgba(196,146,42,0.04)',
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

function TwoMethodCard({
  title,
  methodA,
  methodB,
}: {
  title: string
  methodA: NumberResult
  methodB: NumberResult
}) {
  const same = methodA.value === methodB.value
  return (
    <div style={{
      backgroundColor: 'var(--color-dark)', borderRadius: 16,
      padding: '16px', border: '1px solid rgba(196,146,42,0.15)',
    }}>
      <SectionLabel title={`${title} — Hai Phương Pháp`} style={{ color: 'var(--color-gold)', marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{
          backgroundColor: 'rgba(250,248,243,0.06)', borderRadius: 12, padding: '12px',
          borderLeft: '2px solid var(--color-gold)',
        }}>
          <p style={{ fontSize: 9, color: 'rgba(250,248,243,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
            Cộng gộp ngang
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, color: 'white', margin: '0 0 4px', lineHeight: 1 }}>
            {methodA.display}
          </p>
          {methodA.isMasterNumber && (
            <span style={{ fontSize: 9, color: '#E8C97A', fontFamily: 'var(--font-ui)' }}>Số chủ</span>
          )}
          {methodA.workings && (
            <pre style={{ fontSize: 9, color: 'rgba(250,248,243,0.4)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.4, margin: '6px 0 0' }}>
              {methodA.workings}
            </pre>
          )}
        </div>
        <div style={{
          backgroundColor: 'rgba(250,248,243,0.06)', borderRadius: 12, padding: '12px',
          borderLeft: '2px solid rgba(250,248,243,0.15)',
        }}>
          <p style={{ fontSize: 9, color: 'rgba(250,248,243,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
            Cộng rút gọn
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, color: 'white', margin: '0 0 4px', lineHeight: 1 }}>
            {methodB.display}
          </p>
          {methodB.isMasterNumber && (
            <span style={{ fontSize: 9, color: '#E8C97A', fontFamily: 'var(--font-ui)' }}>Số chủ</span>
          )}
          {methodB.workings && (
            <pre style={{ fontSize: 9, color: 'rgba(250,248,243,0.4)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.4, margin: '6px 0 0' }}>
              {methodB.workings}
            </pre>
          )}
        </div>
      </div>
      {!same && (
        <p style={{ fontSize: 10, color: 'rgba(250,248,243,0.4)', margin: '10px 0 0', fontFamily: 'var(--font-ui)', lineHeight: 1.4 }}>
          ℹ Hai phương pháp có thể cho kết quả khác nhau — cả hai đều đúng theo hệ thống Pythagore.
        </p>
      )}
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
  const personalMonth = calculatePersonalMonth(personalYear, today.getMonth() + 1)
  const personalDay = calculatePersonalDay(personalMonth, today.getDate())
  const currentMonthNum = today.getMonth() + 1

  // Month strip data (all 12 months)
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

  // Essence number (sum of active transit values, reduced)
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

  // Number detail list rows (with workings)
  const detailRows = [
    { num: profile.lifePath.display, val: profile.lifePath.value, isMaster: profile.lifePath.isMasterNumber, title: 'Đường Đời', sub: lifePathContent?.overview?.slice(0, 60) ?? 'Mục đích cuộc sống', workings: profile.lifePath.workings },
    { num: profile.destiny.methodA.display, val: profile.destiny.methodA.value, isMaster: profile.destiny.methodA.isMasterNumber, title: 'Vận Mệnh', sub: 'Sứ mệnh tiềm ẩn trong tên khai sinh', workings: profile.destiny.methodA.workings },
    { num: profile.soul.methodA.display, val: profile.soul.methodA.value, isMaster: profile.soul.methodA.isMasterNumber, title: 'Linh Hồn', sub: 'Khao khát và động lực nội tâm', workings: profile.soul.methodA.workings },
    { num: profile.personality.methodA.display, val: profile.personality.methodA.value, isMaster: profile.personality.methodA.isMasterNumber, title: 'Nhân Cách', sub: 'Ấn tượng bên ngoài với thế giới', workings: profile.personality.methodA.workings },
    { num: profile.maturity.display, val: profile.maturity.value, isMaster: profile.maturity.isMasterNumber, title: 'Trưởng Thành', sub: 'Tiềm năng cuối cuộc đời', workings: profile.maturity.workings },
  ]

  const transitRows = [
    { label: 'Thể Chất (Tên)', transit: physicalTransit, namePart: nameParts.firstName },
    ...(mentalTransit ? [{ label: 'Tinh Thần (Tên đệm)', transit: mentalTransit, namePart: nameParts.middleName ?? '' }] : []),
    { label: 'Tâm Linh (Họ)', transit: spiritualTransit, namePart: nameParts.lastName },
  ]

  // Isolation number workings
  const birthDigits = birthDateStr.replace(/-/g, '').split('').map(Number).filter((d) => d > 0)
  const uniqueBirthDigits = [...new Set(birthDigits)].sort()

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
            backgroundColor: '#C4922A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 600, color: 'white',
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

        {/* ── 2. Core numbers — progress rings ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            backgroundColor: 'var(--color-white)', borderRadius: 20,
            padding: '18px 10px 14px', border: '0.5px solid var(--color-border)',
          }}>
            <SectionLabel title="Số Cốt Lõi" style={{ paddingLeft: 10, marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {[
                { nr: profile.lifePath, label: 'Đường Đời' },
                { nr: profile.destiny.methodA, label: 'Vận Mệnh' },
                { nr: profile.soul.methodA, label: 'Linh Hồn' },
              ].map(({ nr, label }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <ProgressRing val={nr.value} display={nr.display} isMaster={nr.isMasterNumber} />
                  <span style={{ fontSize: 10, color: 'var(--color-mid)', letterSpacing: '0.04em', fontFamily: 'var(--font-ui)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Secondary numbers grid ── */}
        <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { nr: profile.personality.methodA, label: 'Nhân Cách' },
            { nr: profile.maturity, label: 'Trưởng Thành' },
            { nr: profile.birthDay, label: 'Ngày Sinh' },
          ].map(({ nr, label }) => (
            <div key={label} style={{
              backgroundColor: 'var(--color-white)', borderRadius: 14,
              border: '0.5px solid var(--color-border)', padding: '12px 10px',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 500, color: 'var(--color-dark)', margin: '0 0 4px' }}>
                {nr.display}
              </p>
              <p style={{ fontSize: 9, fontWeight: 400, color: 'var(--color-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontFamily: 'var(--font-ui)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── 3. Dark forecast card ── */}
        <div style={{
          backgroundColor: '#1C1A14', borderRadius: 20,
          margin: '0 16px 14px', padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <SectionLabel title="Năm Cá Nhân" style={{ color: 'var(--color-gold)', marginBottom: 6 }} />
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 300, color: 'white', lineHeight: 1, margin: '0 0 4px' }}>
                {personalYear.display}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(250,248,243,0.5)', margin: 0, fontFamily: 'var(--font-ui)' }}>
                {today.getFullYear()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(250,248,243,0.4)', fontSize: 10, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
                Tháng Cá Nhân
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 500, color: '#E8C97A', margin: 0 }}>
                {personalMonth.display}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(250,248,243,0.4)', margin: '4px 0 0', fontFamily: 'var(--font-ui)' }}>
                Ngày: {personalDay.display}
              </p>
            </div>
          </div>

          {/* Month strip */}
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }} className="hide-scrollbar">
            {monthStrip.map(({ month, display }) => {
              const isActive = month === currentMonthNum
              return (
                <div key={month} style={{
                  flexShrink: 0, borderRadius: 20, padding: '5px 9px',
                  backgroundColor: isActive ? '#E8C97A' : 'rgba(250,248,243,0.08)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{
                    fontSize: 11, color: isActive ? '#1C1A14' : 'rgba(250,248,243,0.5)',
                    fontFamily: 'var(--font-ui)', fontWeight: isActive ? 600 : 400,
                  }}>
                    T{month}
                  </span>
                  <span style={{
                    fontSize: 9, color: isActive ? '#1C1A14' : 'rgba(250,248,243,0.5)',
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
              flex: 1, backgroundColor: 'var(--color-gold)', color: 'white',
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

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 5. CHI TIẾT SỐ (with Cách tính workings) ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            backgroundColor: 'var(--color-white)', borderRadius: 16,
            border: '0.5px solid var(--color-border)', padding: '16px 16px 0',
          }}>
            <SectionLabel title="Chi Tiết Số" style={{ marginBottom: 12 }} />
            {detailRows.map(({ num, val, isMaster, title, sub, workings }, idx) => (
              <div key={title} style={{
                padding: '14px 0',
                borderBottom: idx < detailRows.length - 1 ? '0.5px solid rgba(28,22,10,0.07)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    fontFamily: 'Georgia, serif', fontSize: isMaster ? 26 : 36,
                    fontWeight: 400, color: 'var(--color-dark)',
                    minWidth: 44, lineHeight: 1, flexShrink: 0,
                  }}>
                    {num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 2px', fontFamily: 'var(--font-ui)' }}>
                      {title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '0 0 8px', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
                      {sub}
                    </p>
                    <div style={{ height: 4, backgroundColor: 'rgba(28,22,10,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(Math.min(val, 9) / 9) * 100}%`,
                        backgroundColor: '#C4922A', borderRadius: 2,
                      }} />
                    </div>
                  </div>
                </div>
                <WorkingsBlock workings={workings} />
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 6. SỐ VẬN MỆNH — HAI PHƯƠNG PHÁP ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 16px 14px' }}>
          <TwoMethodCard title="Số Vận Mệnh" methodA={profile.destiny.methodA} methodB={profile.destiny.methodB} />
        </div>

        {/* ── 7. SỐ LINH HỒN — HAI PHƯƠNG PHÁP ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <TwoMethodCard title="Số Linh Hồn" methodA={profile.soul.methodA} methodB={profile.soul.methodB} />
        </div>

        {/* ── 8. SỐ NHÂN CÁCH — HAI PHƯƠNG PHÁP ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <TwoMethodCard title="Số Nhân Cách" methodA={profile.personality.methodA} methodB={profile.personality.methodB} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 9. SỐ THÁI ĐỘ + SỐ KẾT NỐI (side by side) ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Attitude */}
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

          {/* Bridge */}
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

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 10. SỐ TÊN MẸ (if exists) ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
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
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: 0, lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
                    Ảnh hưởng của mẹ lên biểu đồ số học
                  </p>
                </div>
              </div>
              <WorkingsBlock workings={profile.motherName.workings} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 11. SỐ CÔ LẬP ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            backgroundColor: 'var(--color-white)', borderRadius: 16,
            border: '0.5px solid var(--color-border)', padding: '16px',
          }}>
            <SectionLabel title="Số Cô Lập" style={{ marginBottom: 12 }} />

            {profile.isolationNumbers.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-green)', margin: 0, fontFamily: 'var(--font-ui)' }}>
                Không có số cô lập ✓
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {profile.isolationNumbers.map((num) => (
                    <div key={num} style={{
                      width: 40, height: 40, borderRadius: 10,
                      backgroundColor: 'rgba(163,45,45,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: 'var(--color-danger)',
                    }}>
                      {num}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '0 0 8px', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
                  Số xuất hiện trong ngày sinh nhưng bị cô lập trên lưới 3×3
                </p>
              </>
            )}

            <div style={{
              marginTop: 8,
              borderLeft: '2px solid var(--color-gold)',
              backgroundColor: 'rgba(196,146,42,0.04)',
              borderRadius: '0 6px 6px 0',
              padding: '6px 10px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-gold)', margin: '0 0 2px', fontFamily: 'var(--font-ui)', letterSpacing: '0.04em' }}>
                Cách tính:
              </p>
              <pre style={{ fontSize: 11, color: 'var(--color-mid)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                {`Ngày sinh: ${birthDateStr} → Chữ số: ${uniqueBirthDigits.join(', ')}\nSố cô lập: ${profile.isolationNumbers.length > 0 ? profile.isolationNumbers.join(', ') : 'Không có'}`}
              </pre>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 12. SỐ TINH CHẤT (Essence / Transit — kept from new design) ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
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
                borderBottom: idx < transitRows.length - 1 ? '0.5px solid rgba(28,22,10,0.07)' : 'none',
              }}>
                <span style={{ fontSize: 11, color: 'var(--color-mid)', width: 110, fontFamily: 'var(--font-ui)', lineHeight: 1.3 }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 500, color: 'var(--color-dark)' }}>
                  {transit.letter} · {transit.value}
                </span>
                <span style={{
                  fontSize: 10, color: 'var(--color-gold)',
                  backgroundColor: 'rgba(196,146,42,0.08)', borderRadius: 10,
                  padding: '2px 8px', fontFamily: 'var(--font-ui)', fontWeight: 500,
                }}>
                  {namePart}
                </span>
              </div>
            ))}

            <div style={{
              marginTop: 10, backgroundColor: 'rgba(196,146,42,0.07)',
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

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── 13. BÀI HỌC NHÂN QUẢ ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
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
                        backgroundColor: 'rgba(196,146,42,0.08)',
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
