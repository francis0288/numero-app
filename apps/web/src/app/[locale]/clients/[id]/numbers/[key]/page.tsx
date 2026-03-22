import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateFullProfile } from '@numero-app/core'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'

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

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!client) notFound()

  const interpretation = await prisma.interpretation.findFirst({
    where: { numberKey: key, locale: client.preferredLanguage },
  })
  if (!interpretation) notFound()

  const content: InterpContent = JSON.parse(interpretation.baseText)

  const displayNum = key.split('_').at(-1) ?? ''

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]
  const freshProfile = calculateFullProfile({
    birthDate: birthDateStr,
    birthCertName: client.birthCertName,
    currentName: client.currentName,
  })

  let numberWorkings: string | undefined
  if (key.startsWith('karmic_lesson_')) {
    numberWorkings = `Bài học nghiệp là các số vắng mặt trong tên khai sinh.\nTên tính: ${client.birthCertName}`
  } else if (key.startsWith('life_path_') || key.startsWith('master_')) {
    numberWorkings = freshProfile.lifePath.workings
  } else if (key.startsWith('karmic_debt_')) {
    numberWorkings = freshProfile.destiny.methodA.workings
  } else {
    numberWorkings = freshProfile.lifePath.workings
  }

  const profilePath =
    locale === 'en'
      ? `/clients/${id}/profile`
      : `/${locale}/clients/${id}/profile`

  const categoryLabel = interpretation.category.replace(/_/g, ' ')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

        {/* Back link */}
        <div style={{ padding: '20px 16px 12px' }}>
          <a
            href={profilePath}
            style={{ fontSize: 13, color: 'var(--color-mid)', textDecoration: 'none' }}
          >
            ← Quay lại hồ sơ
          </a>
        </div>

        {/* Hero card */}
        <div style={{
          margin: '0 16px 16px',
          backgroundColor: 'var(--color-dark)',
          borderRadius: 20,
          padding: '28px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize: 72,
            fontWeight: 300,
            color: 'var(--color-gold)',
            lineHeight: 1,
            flexShrink: 0,
          }}>
            {displayNum}
          </span>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(250,248,243,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontFamily: 'var(--font-ui)' }}>
              {categoryLabel}
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--color-base)', margin: 0, lineHeight: 1.3 }}>
              {content.title}
            </h1>
          </div>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Workings */}
          {numberWorkings && (
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 16,
              border: '0.5px solid var(--color-border)',
              borderLeft: '3px solid var(--color-gold)',
              padding: '14px 16px',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gold)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                Cách tính số này
              </p>
              <pre style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-mid)', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>
                {numberWorkings}
              </pre>
            </div>
          )}

          {/* Keywords */}
          {content.keywords?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {content.keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    backgroundColor: 'rgba(196,146,42,0.10)',
                    color: 'var(--color-gold)',
                    borderRadius: 20,
                    padding: '5px 14px',
                    fontSize: 12,
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          {content.overview && (
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 16,
              border: '0.5px solid var(--color-border)',
              padding: '16px',
            }}>
              <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                Tổng Quan
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-dark)', lineHeight: 1.6, margin: 0 }}>
                {content.overview}
              </p>
            </div>
          )}

          {/* Strengths + Challenges */}
          {(content.strengths?.length > 0 || content.challenges?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {content.strengths?.length > 0 && (
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 16,
                  border: '0.5px solid var(--color-border)',
                  padding: '14px',
                }}>
                  <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-green)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                    Điểm Mạnh
                  </h2>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {content.strengths.map((s) => (
                      <li key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--color-green)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ color: 'var(--color-dark)', lineHeight: 1.4 }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {content.challenges?.length > 0 && (
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 16,
                  border: '0.5px solid var(--color-border)',
                  padding: '14px',
                }}>
                  <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-mid)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                    Thách Thức
                  </h2>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {content.challenges.map((c) => (
                      <li key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--color-mid)', flexShrink: 0, marginTop: 1 }}>○</span>
                        <span style={{ color: 'var(--color-mid)', lineHeight: 1.4 }}>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Life lesson */}
          {content.lifeLesson && (
            <div style={{
              backgroundColor: 'rgba(196,146,42,0.06)',
              borderLeft: '3px solid var(--color-gold)',
              borderRadius: '0 12px 12px 0',
              padding: '14px 16px',
            }}>
              <h2 style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gold)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                Bài Học Cuộc Đời
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-dark)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                {content.lifeLesson}
              </p>
            </div>
          )}

          {/* Compatible numbers */}
          {content.compatibleNumbers?.length > 0 && (
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 16,
              border: '0.5px solid var(--color-border)',
              padding: '16px',
            }}>
              <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                Số Tương Hợp
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {content.compatibleNumbers.map((n) => (
                  <div
                    key={n}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(196,146,42,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Georgia, serif',
                      fontSize: 18,
                      fontWeight: 500,
                      color: 'var(--color-gold)',
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career + Astro */}
          {(content.careerSuggestions?.length > 0 || content.astrological) && (
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 16,
              border: '0.5px solid var(--color-border)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              {content.careerSuggestions?.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                    Gợi Ý Nghề Nghiệp
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: 0, lineHeight: 1.5 }}>
                    {content.careerSuggestions.join(' · ')}
                  </p>
                </div>
              )}
              {content.astrological && (
                <div>
                  <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-dark)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
                    Ảnh Hưởng Chiêm Tinh
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                    {content.astrological}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNav locale={locale} clientId={id} />
    </div>
  )
}
