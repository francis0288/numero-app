import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NavBar } from '@/components/NavBar'
import { BottomNav } from '@/components/BottomNav'
import { formatDateShortVI } from '@/lib/formatDate'

const LANG_DISPLAY: Record<string, string> = {
  en: '🇬🇧 English',
  zh: '🇨🇳 中文',
  vi: '🇻🇳 Tiếng Việt',
}

const MODE_LABELS: Record<string, string> = {
  book:       'Theo Sách',
  warm:       'Ấm Áp',
  practical:  'Thực Tiễn',
  truth:      'Sự Thật',
  // legacy tone values
  analytical: 'Phân Tích',
  spiritual:  'Tâm Linh',
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
  const newReadingPath = locale === 'en' ? `/clients/${id}/reading?new=1` : `/${locale}/clients/${id}/reading?new=1`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-base)' }}>
      <NavBar locale={locale} />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

        {/* Header */}
        <div style={{ padding: '20px 16px 16px' }}>
          <a
            href={profilePath}
            style={{ fontSize: 13, color: 'var(--color-mid)', textDecoration: 'none', display: 'inline-block', marginBottom: 10 }}
          >
            ← Quay lại hồ sơ
          </a>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 400, color: 'var(--color-dark)', margin: 0, lineHeight: 1.2 }}>
            Lịch Sử Bài Đọc
          </h1>
          <p style={{ fontSize: 11, color: 'var(--color-mid)', margin: '3px 0 0', fontFamily: 'var(--font-ui)' }}>
            {[client.lastName, client.middleName, client.firstName].filter(Boolean).join(' ')}
          </p>
        </div>

        {readings.length === 0 ? (
          <div style={{
            margin: '0 16px',
            backgroundColor: 'var(--color-white)',
            borderRadius: 16,
            border: '0.5px solid var(--color-border)',
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: '0 0 20px' }}>Chưa có bài đọc.</p>
            <a
              href={newReadingPath}
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-gold)',
                color: 'white',
                borderRadius: 12,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Tạo bài đọc đầu tiên →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {readings.map((r) => {
              const preview = (r.editedNarrative ?? r.aiNarrative ?? '').slice(0, 150)
              const readingLink = locale === 'en'
                ? `/clients/${id}/reading?id=${r.id}`
                : `/${locale}/clients/${id}/reading?id=${r.id}`
              return (
                <a
                  key={r.id}
                  href={readingLink}
                  style={{
                    display: 'block',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 16,
                    border: '0.5px solid var(--color-border)',
                    padding: '14px 16px',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        backgroundColor: 'var(--gold-bg)',
                        color: 'var(--color-gold)',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 10,
                      }}>
                        v{r.version}
                      </span>
                      <span style={{
                        backgroundColor: 'var(--color-base)',
                        color: 'var(--color-mid)',
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 10,
                        border: '0.5px solid var(--color-border)',
                      }}>
                        {LANG_DISPLAY[r.language] ?? r.language}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-mid)' }}>
                        {MODE_LABELS[r.readingMode ?? r.tone] ?? r.readingMode ?? r.tone}
                      </span>
                      {r.isPrivate && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8,
                          backgroundColor: 'color-mix(in srgb, #1C1A14 8%, transparent)',
                          color: 'var(--color-mid)',
                        }}>
                          🔒 Riêng tư
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {r.status === 'finalised' ? (
                        <span style={{
                          backgroundColor: 'color-mix(in srgb, var(--status-success) 8%, transparent)',
                          color: 'var(--color-green)',
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 10,
                          border: '0.5px solid color-mix(in srgb, var(--status-success) 20%, transparent)',
                        }}>
                          Hoàn thành
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: 'var(--gold-bg)',
                          color: 'var(--gold-main)',
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 10,
                          border: '0.5px solid color-mix(in srgb, var(--gold-main) 20%, transparent)',
                        }}>
                          Bản nháp
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--color-mid)', fontFamily: 'var(--font-ui)' }}>
                        {formatDateShortVI(r.createdAt)}
                      </span>
                    </div>
                  </div>
                  {preview && (
                    <p style={{
                      fontSize: 12,
                      color: 'var(--color-mid)',
                      margin: '10px 0 0',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    } as React.CSSProperties}>
                      {preview}…
                    </p>
                  )}
                </a>
              )
            })}
          </div>
        )}

        {readings.length > 0 && (
          <div style={{ padding: '16px 16px 0' }}>
            <a
              href={newReadingPath}
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-gold)',
                color: 'white',
                borderRadius: 12,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Tạo bài đọc mới →
            </a>
          </div>
        )}
      </main>
      <BottomNav locale={locale} clientId={id} />
    </div>
  )
}
