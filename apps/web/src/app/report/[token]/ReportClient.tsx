'use client'

import { useState, useEffect } from 'react'
import type { NumerologyProfile, ForecastProfile } from '@numero-app/core'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Interpretation {
  title?: string
  overview?: string
  strengths?: string[]
  challenges?: string[]
  lifeLesson?: string
  keywords?: string[]
  [key: string]: unknown
}

export interface ReportClientProps {
  clientData: { firstName: string; lastName: string; dateOfBirth: string }
  readingData: { createdAt: string; aiNarrative: string | null; editedNarrative: string | null }
  profile: NumerologyProfile
  forecastCurr: ForecastProfile
  forecastNext: ForecastProfile
  currentYear: number
  nextYear: number
  interpretations_vi: Record<string, Interpretation>
  interpretations_en: Record<string, Interpretation>
  practitioner: { name: string; logoUrl: string | null; brandingFooter: string | null }
  token: string
  karmicDebtNums: number[]
  isolationNumber: number
}

// ── Themes ─────────────────────────────────────────────────────────────────────

const THEMES = {
  dark: {
    pageBg: '#0D0D1A',
    cardBg: '#1A1A2E',
    cardBorder: '#2D2D4E',
    heading: '#D4AC6E',
    body: '#C8C8D4',
    muted: '#888899',
    accent: '#7B5EA7',
    number: '#D4AC6E',
    divider: '#2D2D4E',
    headerBg: '#1A1A2E',
    sectionBg: '#0D0D1A',
    altSectionBg: '#0F0F20',
    footerBg: '#0D0D1A',
    footerBorder: '#2D2D4E',
    masterBadgeBg: 'rgba(212,172,110,0.12)',
    masterBadgeBorder: '#D4AC6E',
    masterBadgeText: '#D4AC6E',
    karmicBadgeBg: 'rgba(239,68,68,0.1)',
    karmicBadgeBorder: '#ef4444',
    karmicBadgeText: '#f87171',
    summaryBoxBg: 'rgba(123,94,167,0.2)',
    summaryBoxBorder: 'rgba(123,94,167,0.4)',
    karmicCardBorderLeft: '#ef4444',
    forecastHeaderBg: '#12122A',
    themePillBg: 'rgba(212,172,110,0.15)',
    themePillText: '#D4AC6E',
    themePillBorder: 'rgba(212,172,110,0.3)',
    tagBg: 'rgba(123,94,167,0.15)',
    tagText: '#9B7DC8',
    tagBorder: 'rgba(123,94,167,0.3)',
    toggleBg: 'rgba(255,255,255,0.08)',
    toggleText: '#C8C8D4',
    toggleBorder: 'rgba(255,255,255,0.12)',
  },
  light: {
    pageBg: '#FDF6EC',
    cardBg: '#FFFFFF',
    cardBorder: '#E8E0F0',
    heading: '#7B5EA7',
    body: '#2C2C2C',
    muted: '#888888',
    accent: '#D4AC6E',
    number: '#7B5EA7',
    divider: '#E8E0F0',
    headerBg: '#7B5EA7',
    sectionBg: '#FDF6EC',
    altSectionBg: '#F5F0FB',
    footerBg: '#2C2C2C',
    footerBorder: 'transparent',
    masterBadgeBg: '#FFFBF0',
    masterBadgeBorder: '#D4AC6E',
    masterBadgeText: '#A07830',
    karmicBadgeBg: '#FFF0F0',
    karmicBadgeBorder: '#ef4444',
    karmicBadgeText: '#dc2626',
    summaryBoxBg: '#F5F0FB',
    summaryBoxBorder: '#E8E0F0',
    karmicCardBorderLeft: '#f97316',
    forecastHeaderBg: '#7B5EA7',
    themePillBg: 'rgba(212,172,110,0.15)',
    themePillText: '#8B6820',
    themePillBorder: 'rgba(212,172,110,0.5)',
    tagBg: 'rgba(123,94,167,0.08)',
    tagText: '#7B5EA7',
    tagBorder: 'rgba(123,94,167,0.25)',
    toggleBg: 'rgba(0,0,0,0.12)',
    toggleText: '#FFFFFF',
    toggleBorder: 'rgba(255,255,255,0.3)',
  },
} as const

type ThemeKey = 'dark' | 'light'
type TC = typeof THEMES[ThemeKey]

// ── Personal Year info ─────────────────────────────────────────────────────────

const PY_INFO: Record<number, { theme: string; bullets: string[] }> = {
  1: { theme: 'New Beginnings & Independence', bullets: ['Plant seeds for the next 9-year cycle', 'Assert your independence and leadership', 'Launch new projects and initiatives'] },
  2: { theme: 'Partnership & Patience', bullets: ['Nurture key relationships and collaborations', 'Practice diplomacy and sensitivity', 'Trust the slow and steady unfolding'] },
  3: { theme: 'Creativity & Expression', bullets: ['Let your creative gifts flow freely', 'Expand your social connections and joy', 'Speak your truth with confidence'] },
  4: { theme: 'Work, Order & Foundation', bullets: ['Build solid structures for long-term success', 'Focus on practical planning and discipline', 'Lay the groundwork for future growth'] },
  5: { theme: 'Change, Freedom & Adventure', bullets: ['Embrace change and new experiences', 'Release what no longer serves you', 'Explore new horizons and expand your world'] },
  6: { theme: 'Home, Responsibility & Healing', bullets: ['Prioritise family and community', 'Offer your gifts in service to others', 'Create beauty and harmony in your environment'] },
  7: { theme: 'Reflection, Study & Inner Wisdom', bullets: ['Retreat inward for deep reflection', 'Pursue spiritual growth and higher knowledge', 'Trust your intuition over external noise'] },
  8: { theme: 'Achievement, Power & Abundance', bullets: ['Step into your personal power', 'Pursue ambitious goals and material success', 'Lead with integrity and strength'] },
  9: { theme: 'Completion, Release & Compassion', bullets: ['Complete unfinished cycles with grace', 'Release the old to welcome the new', 'Serve humanity with your expanded heart'] },
  11: { theme: 'Illumination & Spiritual Mastery', bullets: ['Heighten your intuition and spiritual awareness', 'Inspire others through your light', 'Balance the spiritual with the practical'] },
  22: { theme: 'Mastery & Large-Scale Building', bullets: ['Realise your most ambitious visions', 'Build lasting legacies for the collective', 'Lead transformative projects with vision'] },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getNumberKey(r: { value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean; karmicDebtNumber?: number }) {
  if (r.isKarmicDebt && r.karmicDebtNumber) return `karmic_debt_${r.karmicDebtNumber}`
  if (r.isMasterNumber) return `master_${r.value}`
  return `life_path_${r.value}`
}

function sentences(text: string | undefined) {
  if (!text) return []
  return (text.match(/[^.!?]+[.!?]+/g) ?? []).map(s => s.trim()).filter(s => s.length > 10)
}

function extractClosing(narrative: string) {
  const parts = narrative.split(/\n(?=## )/)
  const closing = parts.find(s =>
    /closing|conclusion|forward|guidance/i.test(s.split('\n')[0])
  ) ?? parts[parts.length - 1]
  if (!closing) return ''
  return closing.split('\n').slice(1).join('\n').trim()
}

const STARFIELD = [
  'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.7) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 85% 12%, rgba(255,255,255,0.5) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 45% 78%, rgba(255,255,255,0.55) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 65% 40%, rgba(255,255,255,0.4) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 30% 58%, rgba(255,255,255,0.5) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 75% 82%, rgba(255,255,255,0.6) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 20% 92%, rgba(255,255,255,0.3) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 92% 52%, rgba(255,255,255,0.45) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 53% 8%, rgba(255,255,255,0.6) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 8% 48%, rgba(255,255,255,0.4) 0%, transparent 100%)',
  'radial-gradient(2px 2px at 38% 33%, rgba(212,172,110,0.35) 0%, transparent 100%)',
  'radial-gradient(2px 2px at 72% 67%, rgba(212,172,110,0.25) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 58% 55%, rgba(255,255,255,0.35) 0%, transparent 100%)',
  'radial-gradient(1px 1px at 22% 70%, rgba(255,255,255,0.45) 0%, transparent 100%)',
].join(', ')

const DEBT_LABELS: Record<number, [string, number]> = {
  13: ['The Hard Worker', 4],
  14: ['The Adventurer', 5],
  16: ['The Humbling', 7],
  19: ['The Independent', 1],
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeading({ title, tc }: { title: string; tc: TC }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <div style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: tc.heading, flexShrink: 0 }} />
      <h2 style={{ color: tc.heading, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}

function NumberCard({ label, result, interp, tc }: {
  label: string
  result: { display: string; value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean }
  interp?: Interpretation
  tc: TC
}) {
  return (
    <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {result.isMasterNumber && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: `1px solid ${tc.masterBadgeBorder}`, backgroundColor: tc.masterBadgeBg, color: tc.masterBadgeText }}>
              Master
            </span>
          )}
          {result.isKarmicDebt && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: `1px solid ${tc.karmicBadgeBorder}`, backgroundColor: tc.karmicBadgeBg, color: tc.karmicBadgeText }}>
              Karmic Debt
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 48, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 8 }}>{result.display}</div>
      {interp?.title && <p style={{ fontSize: 13, fontWeight: 600, color: tc.body, margin: '0 0 6px' }}>{interp.title}</p>}
      {interp?.overview && (
        <p style={{ fontSize: 11, color: tc.muted, lineHeight: 1.6, margin: 0 }}>{interp.overview.slice(0, 80)}…</p>
      )}
    </div>
  )
}

function MarkdownNarrative({ text, tc }: { text: string; tc: TC }) {
  const sections = text.split(/\n(?=## )/)
  return (
    <div>
      {sections.map((sec, i) => {
        const lines = sec.split('\n')
        const heading = lines[0].replace(/^## /, '').trim()
        const paras = lines.slice(1).join('\n').trim().split(/\n\n+/).filter(Boolean)
        return (
          <div key={i}>
            {heading && (
              <h2 style={{ color: tc.heading, fontSize: 17, fontWeight: 500, marginTop: 32, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${tc.divider}` }}>
                {heading}
              </h2>
            )}
            {paras.map((p, j) => (
              <p key={j} style={{ color: tc.body, fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{p}</p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────────

export function ReportClient({
  clientData, readingData, profile, forecastCurr, forecastNext, currentYear, nextYear,
  interpretations_vi, interpretations_en, practitioner, token, karmicDebtNums, isolationNumber,
}: ReportClientProps) {
  const [theme, setTheme] = useState<ThemeKey>('dark')
  const [reportLang, setReportLang] = useState('vi')

  useEffect(() => {
    const saved = localStorage.getItem('report-theme')
    if (saved === 'dark' || saved === 'light') setTheme(saved)
  }, [])

  const toggleTheme = () => {
    const next: ThemeKey = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('report-theme', next)
  }

  const tc = THEMES[theme]
  const interpretations = reportLang === 'en' ? interpretations_en : interpretations_vi
  const narrative = readingData.editedNarrative ?? readingData.aiNarrative ?? ''

  const CORE_CARDS = [
    { key: 'lifePath', label: 'Life Path', result: profile.lifePath },
    { key: 'destiny', label: 'Destiny', result: profile.destiny },
    { key: 'soul', label: 'Soul', result: profile.soul },
    { key: 'personality', label: 'Personality', result: profile.personality },
    { key: 'maturity', label: 'Maturity', result: profile.maturity },
    { key: 'birthDay', label: 'Birth Day', result: profile.birthDay },
    { key: 'currentName', label: 'Current Name', result: profile.currentName },
  ]

  const lifePathInterp = interpretations[getNumberKey(profile.lifePath)]
  const destinyInterp = interpretations[getNumberKey(profile.destiny)]

  const pyCurr = forecastCurr.personalYear
  const pyNext = forecastNext.personalYear
  const pyCurrInfo = PY_INFO[pyCurr.value] ?? PY_INFO[1]
  const pyNextInfo = PY_INFO[pyNext.value] ?? PY_INFO[1]

  const pinCurr = forecastCurr.pinnacles.find(p => p.isCurrent)
  const chCurr = forecastCurr.challenges.find(c => c.isCurrent)
  const pinNext = forecastNext.pinnacles.find(p => p.isCurrent)
  const chNext = forecastNext.challenges.find(c => c.isCurrent)

  const strengthBullets: string[] = (lifePathInterp?.strengths as string[] | undefined) ?? sentences(lifePathInterp?.overview).slice(0, 3)
  const growthBullets: string[] = (lifePathInterp?.challenges as string[] | undefined) ?? sentences(lifePathInterp?.overview).slice(3, 6)
  const pathBullets: string[] = [
    ...sentences((lifePathInterp?.lifeLesson as string | undefined) ?? lifePathInterp?.overview).slice(-2),
    ...sentences(destinyInterp?.overview).slice(0, 1),
  ]
  const closingText = narrative ? extractClosing(narrative) : ''

  const S_DIVIDER = { borderTop: `1px solid ${tc.divider}`, borderBottom: `1px solid ${tc.divider}` }

  return (
    <div style={{ backgroundColor: tc.pageBg, minHeight: '100vh' }}>

      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 50,
          padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          backgroundColor: tc.toggleBg, color: tc.toggleText, border: `1px solid ${tc.toggleBorder}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
      </button>

      {/* ── Language toggle ── */}
      <button
        onClick={() => setReportLang(l => l === 'vi' ? 'en' : 'vi')}
        style={{
          position: 'fixed', top: 16, right: 120, zIndex: 50,
          padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          backgroundColor: reportLang === 'vi' ? 'rgba(255,255,255,0.12)' : '#7B5EA7',
          color: reportLang === 'vi' ? tc.toggleText : '#ffffff',
          border: `1px solid ${reportLang === 'vi' ? tc.toggleBorder : '#7B5EA7'}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {reportLang === 'vi' ? '🌐 ENG' : '🌐 TIẾNG VIỆT'}
      </button>

      {/* ── HEADER ── */}
      <header style={{
        backgroundColor: tc.headerBg,
        backgroundImage: theme === 'dark' ? STARFIELD : undefined,
        padding: '64px 16px',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          {practitioner.logoUrl && (
            <img src={practitioner.logoUrl} alt={practitioner.name}
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '2px solid rgba(212,172,110,0.4)' }} />
          )}
          <p style={{ color: 'rgba(212,172,110,0.7)', fontSize: 13, marginBottom: 24 }}>
            A reading by {practitioner.name}
          </p>

          {/* Decorative number badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {CORE_CARDS.map(({ key, result }) => (
              <div key={key} style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#D4AC6E',
                backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,172,110,0.3)',
              }}>
                {result.display.split('/')[0]}
              </div>
            ))}
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 700, color: '#D4AC6E', margin: '0 0 12px' }}>
            {clientData.firstName} {clientData.lastName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 6px' }}>
            Born on {formatLong(clientData.dateOfBirth)}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
            Reading prepared {formatShort(readingData.createdAt)}
          </p>
        </div>
      </header>

      {/* ── SECTION 1: Key Indicators ── */}
      <section style={{ backgroundColor: tc.sectionBg, padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Key Indicators" tc={tc} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {CORE_CARDS.map(({ key, label, result }) => (
              <NumberCard key={key} label={label} result={result} interp={interpretations[getNumberKey(result)]} tc={tc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Name Index & Isolation Number ── */}
      <section style={{ backgroundColor: tc.altSectionBg, padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Name Index & Isolation Number" tc={tc} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Name Index — Destiny Number</p>
              <div style={{ fontSize: 56, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 12 }}>{profile.destiny.display}</div>
              {destinyInterp?.title && <p style={{ fontSize: 16, fontWeight: 600, color: tc.body, margin: '0 0 12px' }}>{destinyInterp.title}</p>}
              {destinyInterp?.overview && <p style={{ fontSize: 13, color: tc.body, lineHeight: 1.8, margin: 0 }}>{destinyInterp.overview}</p>}
            </div>

            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Isolation Number</p>
              <div style={{ fontSize: 56, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 12 }}>
                {isolationNumber === 0 ? '∞' : isolationNumber}
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: tc.body, margin: '0 0 12px' }}>
                {isolationNumber === 0 ? 'Perfect Integration' : `Integration Point ${isolationNumber}`}
              </p>
              <p style={{ fontSize: 13, color: tc.body, lineHeight: 1.8, margin: '0 0 12px' }}>
                {isolationNumber === 0
                  ? 'Your outer destiny and inner soul are perfectly aligned — a rare and powerful integration of purpose and desire.'
                  : 'The gap between your outer destiny and inner soul reveals where growth and integration are needed most.'}
              </p>
              {isolationNumber > 0 && interpretations[`life_path_${isolationNumber}`]?.overview && (
                <p style={{ fontSize: 12, color: tc.muted, lineHeight: 1.7, margin: 0 }}>
                  {interpretations[`life_path_${isolationNumber}`].overview?.slice(0, 200)}…
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: Missing Numbers & Karmic Lessons ── */}
      <section style={{ backgroundColor: tc.sectionBg, padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Missing Numbers & Karmic Lessons" tc={tc} />
          {profile.karmicLessons.length === 0 ? (
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, color: tc.body, margin: '0 0 4px' }}>All numbers 1–9 present in your name.</p>
              <p style={{ fontSize: 13, color: tc.muted, margin: 0 }}>No karmic lessons — a complete vibration.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {profile.karmicLessons.map(n => {
                const interp = interpretations[`karmic_lesson_${n}`]
                return (
                  <div key={n} style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 20 }}>
                    <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Missing Number</p>
                    <div style={{ fontSize: 48, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 8 }}>{n}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: tc.body, margin: '0 0 8px' }}>
                      {interp?.title ?? `Karmic Lesson ${n}`}
                    </p>
                    {interp?.overview && <p style={{ fontSize: 11, color: tc.muted, lineHeight: 1.6, margin: '0 0 8px' }}>{interp.overview}</p>}
                    <p style={{ fontSize: 11, fontStyle: 'italic', color: tc.muted, margin: 0 }}>Absent from birth name</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: Life Lessons — Karma from Past Lives ── */}
      <section style={{ backgroundColor: tc.altSectionBg, padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Life Lessons — Karma from Past Lives" tc={tc} />
          {karmicDebtNums.length === 0 ? (
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, color: tc.body, margin: '0 0 4px' }}>No karmic debt numbers detected.</p>
              <p style={{ fontSize: 13, color: tc.muted, margin: 0 }}>Your soul enters this life with a clean slate.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {karmicDebtNums.map(n => {
                const interp = interpretations[`karmic_debt_${n}`]
                const [label, base] = DEBT_LABELS[n] ?? [`Debt ${n}`, n % 9 || 9]
                return (
                  <div key={n} style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderLeft: `4px solid ${tc.karmicCardBorderLeft}`, borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 48, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 8 }}>{n}/{base}</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: tc.body, margin: '0 0 12px' }}>
                      {interp?.title ?? `Karmic Debt ${n}/${base} — ${label}`}
                    </p>
                    {interp?.overview && <p style={{ fontSize: 13, color: tc.body, lineHeight: 1.8, margin: 0 }}>{interp.overview}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 5: Summary of Life's Journey ── */}
      <section style={{ backgroundColor: tc.sectionBg, padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Summary of Life's Journey" tc={tc} />
          <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 16, padding: 32 }}>
            {narrative
              ? <MarkdownNarrative text={narrative} tc={tc} />
              : <p style={{ color: tc.muted }}>Reading content not available.</p>}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Annual Forecast ── */}
      <section style={{ backgroundColor: tc.altSectionBg, padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title={`Annual Forecast ${currentYear} & ${nextYear}`} tc={tc} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {([
              { year: currentYear, py: pyCurr, info: pyCurrInfo, pin: pinCurr, ch: chCurr },
              { year: nextYear, py: pyNext, info: pyNextInfo, pin: pinNext, ch: chNext },
            ] as const).map(({ year, py, info, pin, ch }) => (
              <div key={year} style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>

                {/* Year header */}
                <div style={{ backgroundColor: tc.forecastHeaderBg, borderBottom: `1px solid ${tc.cardBorder}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: tc.heading }}>{year}</span>
                  <span style={{ fontSize: 13, padding: '6px 16px', borderRadius: 99, fontWeight: 600, backgroundColor: tc.themePillBg, color: tc.themePillText, border: `1px solid ${tc.themePillBorder}` }}>
                    Personal Year {py.display}
                  </span>
                </div>

                {/* Three columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {[
                    {
                      num: py.display, numVal: py.value, sublabel: 'Personal Year', title: info.theme,
                      interpKey: `life_path_${py.value}`,
                    },
                    {
                      num: pin?.number.display ?? '—', numVal: pin?.number.value, sublabel: 'Pinnacle', title: pin?.label ?? 'Pinnacle Cycle',
                      interpKey: pin ? `life_path_${pin.number.value}` : null,
                    },
                    {
                      num: ch?.number != null ? String(ch.number) : '0', numVal: ch?.number, sublabel: 'Challenge', title: ch?.label ?? 'Challenge Cycle',
                      interpKey: ch?.number != null ? `life_path_${ch.number}` : null,
                    },
                  ].map((col, ci) => (
                    <div key={ci} style={{ padding: 24, borderRight: ci < 2 ? `1px solid ${tc.divider}` : undefined }}>
                      <div style={{ fontSize: 40, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 8 }}>{col.num}</div>
                      <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>{col.sublabel}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: tc.body, margin: '0 0 8px' }}>{col.title}</p>
                      {col.interpKey && interpretations[col.interpKey]?.overview && (
                        <p style={{ fontSize: 11, color: tc.muted, lineHeight: 1.6, margin: 0 }}>
                          {interpretations[col.interpKey]!.overview!.slice(0, 140)}…
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key themes */}
                <div style={{ padding: '16px 32px', borderTop: `1px solid ${tc.divider}` }}>
                  <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Key Themes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {info.bullets.map((b, i) => (
                      <span key={i} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 99, backgroundColor: tc.tagBg, color: tc.tagText, border: `1px solid ${tc.tagBorder}` }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Summary & Future Directions ── */}
      <section style={{ backgroundColor: tc.sectionBg, padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Summary & Future Directions" tc={tc} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* Strengths */}
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tc.heading, margin: '0 0 16px' }}>Your Greatest Strengths</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(strengthBullets.length > 0 ? strengthBullets : [
                  'Your natural gifts flow through your Life Path.',
                  'You have unique wisdom to offer the world.',
                  'Your soul carries deep and lasting potential.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: tc.body }}>
                    <span style={{ color: '#D4AC6E', flexShrink: 0 }}>✓</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth */}
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tc.heading, margin: '0 0 16px' }}>Areas for Growth</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(growthBullets.length > 0 ? growthBullets : [
                  'Embrace vulnerability and openness.',
                  'Balance personal needs with service to others.',
                  'Trust the journey even when the path is unclear.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: tc.body }}>
                    <span style={{ color: tc.accent, flexShrink: 0 }}>○</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Path Forward */}
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tc.heading, margin: '0 0 16px' }}>Your Path Forward</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(pathBullets.length > 0 ? pathBullets : [
                  'Follow the calling of your deepest values.',
                  'Align your daily actions with your soul purpose.',
                  'Trust that you are exactly where you need to be.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: tc.body }}>
                    <span style={{ color: tc.accent, flexShrink: 0 }}>→</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Summary Conclusion */}
          <div style={{ backgroundColor: tc.summaryBoxBg, border: `1px solid ${tc.summaryBoxBorder}`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✨</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: tc.heading, margin: '0 0 24px' }}>Summary Conclusion</h3>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              {closingText ? (
                closingText.split('\n\n').filter(Boolean).slice(0, 2).map((p, i) => (
                  <p key={i} style={{ fontSize: 14, color: tc.body, lineHeight: 1.8, margin: '0 0 16px' }}>{p}</p>
                ))
              ) : (
                <>
                  <p style={{ fontSize: 14, color: tc.body, lineHeight: 1.8, margin: '0 0 16px' }}>
                    With a Life Path {profile.lifePath.display} and Destiny {profile.destiny.display}, you carry a unique blueprint for this lifetime — a combination of gifts, lessons, and purpose that is entirely your own.
                  </p>
                  <p style={{ fontSize: 14, color: tc.body, lineHeight: 1.8, margin: 0 }}>
                    As you move through Personal Year {pyCurr.display} in {currentYear}, this is your invitation to step fully into your potential. Trust the wisdom of your numbers, embrace the journey, and know that every step you take is part of a perfectly orchestrated plan.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: tc.footerBg, borderTop: `1px solid ${tc.footerBorder}`, padding: '48px 16px', textAlign: 'center' }}>
        {practitioner.logoUrl && (
          <img src={practitioner.logoUrl} alt={practitioner.name}
            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '1px solid rgba(255,255,255,0.2)' }} />
        )}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Report Presented by</p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, margin: '0 0 4px' }}>{practitioner.name}</p>
        {practitioner.brandingFooter && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 4px' }}>{practitioner.brandingFooter}</p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '0 0 32px' }}>{formatShort(readingData.createdAt)}</p>
        <a
          href={`/api/report/${token}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', backgroundColor: '#D4AC6E', color: '#0D0D1A', fontWeight: 600, borderRadius: 12, padding: '16px 32px', fontSize: 15, textDecoration: 'none' }}
        >
          ⬇ Download PDF
        </a>
      </footer>

    </div>
  )
}
