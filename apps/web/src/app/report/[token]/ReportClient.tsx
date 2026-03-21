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
  clientData: { firstName: string; middleName?: string | null; lastName: string; dateOfBirth: string }
  readingData: { createdAt: string; aiNarrative: string | null; editedNarrative: string | null }
  profile: NumerologyProfile
  forecastCurr: ForecastProfile
  forecastNext: ForecastProfile
  currentYear: number
  nextYear: number
  interpretations_vi: Record<string, Interpretation>
  interpretations_en: Record<string, Interpretation>
  practitioner: { name: string; logoUrl: string | null; brandingFooter: string | null; phone?: string | null; brandingEmail?: string | null }
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
  1: { theme: 'Khởi Đầu Mới & Độc Lập', bullets: ['Gieo hạt giống cho chu kỳ 9 năm tiếp theo', 'Khẳng định sự độc lập và khả năng lãnh đạo', 'Khởi động các dự án và sáng kiến mới'] },
  2: { theme: 'Hợp Tác & Kiên Nhẫn', bullets: ['Nuôi dưỡng các mối quan hệ và sự hợp tác quan trọng', 'Thực hành ngoại giao và sự nhạy cảm', 'Tin tưởng vào sự phát triển chậm mà chắc'] },
  3: { theme: 'Sáng Tạo & Biểu Đạt', bullets: ['Để tài năng sáng tạo của bạn tự do tuôn chảy', 'Mở rộng các kết nối xã hội và niềm vui', 'Nói lên sự thật của bạn với tự tin'] },
  4: { theme: 'Công Việc, Trật Tự & Nền Tảng', bullets: ['Xây dựng cấu trúc vững chắc cho thành công lâu dài', 'Tập trung vào lập kế hoạch thực tế và kỷ luật', 'Đặt nền móng cho sự phát triển trong tương lai'] },
  5: { theme: 'Thay Đổi, Tự Do & Phiêu Lưu', bullets: ['Đón nhận sự thay đổi và trải nghiệm mới', 'Buông bỏ những gì không còn phục vụ bạn', 'Khám phá chân trời mới và mở rộng thế giới của bạn'] },
  6: { theme: 'Gia Đình, Trách Nhiệm & Chữa Lành', bullets: ['Ưu tiên gia đình và cộng đồng', 'Cống hiến những tài năng của bạn cho người khác', 'Tạo ra vẻ đẹp và sự hòa hợp trong môi trường của bạn'] },
  7: { theme: 'Suy Ngẫm, Học Hỏi & Trí Tuệ Nội Tâm', bullets: ['Hướng nội để suy ngẫm sâu sắc', 'Theo đuổi sự phát triển tâm linh và kiến thức cao hơn', 'Tin tưởng vào trực giác hơn là ồn ào bên ngoài'] },
  8: { theme: 'Thành Công, Quyền Lực & Sung Túc', bullets: ['Bước vào sức mạnh cá nhân của bạn', 'Theo đuổi các mục tiêu đầy tham vọng và thành công vật chất', 'Lãnh đạo với chính trực và sức mạnh'] },
  9: { theme: 'Hoàn Thành, Buông Bỏ & Lòng Nhân Ái', bullets: ['Hoàn thành các chu kỳ còn dang dở một cách ân huệ', 'Buông bỏ cái cũ để chào đón cái mới', 'Phục vụ nhân loại bằng trái tim rộng mở của bạn'] },
  11: { theme: 'Soi Sáng & Thành Thạo Tâm Linh', bullets: ['Nâng cao trực giác và nhận thức tâm linh', 'Truyền cảm hứng cho người khác qua ánh sáng của bạn', 'Cân bằng tâm linh với thực tế'] },
  22: { theme: 'Thành Thạo & Xây Dựng Tầm Lớn', bullets: ['Hiện thực hóa những tầm nhìn đầy tham vọng nhất của bạn', 'Xây dựng di sản bền vững cho tập thể', 'Dẫn dắt các dự án chuyển đổi với tầm nhìn'] },
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

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return phone
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
              Số Master
            </span>
          )}
          {result.isKarmicDebt && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: `1px solid ${tc.karmicBadgeBorder}`, backgroundColor: tc.karmicBadgeBg, color: tc.karmicBadgeText }}>
              Số Nghiệp
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
    { key: 'lifePath', label: 'Đường Đời', result: profile.lifePath },
    { key: 'destiny', label: 'Vận Mệnh', result: profile.destiny.methodA },
    { key: 'soul', label: 'Linh Hồn', result: profile.soul.methodA },
    { key: 'personality', label: 'Nhân Cách', result: profile.personality.methodA },
    { key: 'maturity', label: 'Trưởng Thành', result: profile.maturity },
    { key: 'birthDay', label: 'Ngày Sinh', result: profile.birthDay },
    { key: 'currentName', label: 'Tên Hiện Tại', result: profile.currentName },
  ]

  const lifePathInterp = interpretations[getNumberKey(profile.lifePath)]
  const destinyInterp = interpretations[getNumberKey(profile.destiny.methodA)]

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
        {theme === 'dark' ? '☀ Sáng' : '🌙 Tối'}
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
            Bản đọc bởi {practitioner.name}
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
            {[clientData.lastName, clientData.middleName, clientData.firstName].filter(Boolean).join(' ')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 6px' }}>
            Sinh ngày {formatLong(clientData.dateOfBirth)}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
            Bản đọc được lập {formatShort(readingData.createdAt)}
          </p>
        </div>
      </header>

      {/* ── SECTION 1: Key Indicators ── */}
      <section style={{ backgroundColor: tc.sectionBg, padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Chỉ Số Chính" tc={tc} />
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
          <SectionHeading title="Chỉ Số Tên & Số Cô Lập" tc={tc} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Chỉ Số Tên — Số Vận Mệnh</p>
              <div style={{ fontSize: 56, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 12 }}>{profile.destiny.methodA.display}</div>
              {destinyInterp?.title && <p style={{ fontSize: 16, fontWeight: 600, color: tc.body, margin: '0 0 12px' }}>{destinyInterp.title}</p>}
              {destinyInterp?.overview && <p style={{ fontSize: 13, color: tc.body, lineHeight: 1.8, margin: 0 }}>{destinyInterp.overview}</p>}
            </div>

            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Số Cô Lập</p>
              <div style={{ fontSize: 56, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 12 }}>
                {isolationNumber === 0 ? '∞' : isolationNumber}
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: tc.body, margin: '0 0 12px' }}>
                {isolationNumber === 0 ? 'Hòa Hợp Hoàn Hảo' : `Điểm Kết Hợp ${isolationNumber}`}
              </p>
              <p style={{ fontSize: 13, color: tc.body, lineHeight: 1.8, margin: '0 0 12px' }}>
                {isolationNumber === 0
                  ? 'Vận mệnh bên ngoài và linh hồn bên trong của bạn hoàn toàn hòa hợp — một sự kết hợp hiếm có và mạnh mẽ giữa mục đích và khao khát.'
                  : 'Khoảng cách giữa vận mệnh bên ngoài và linh hồn bên trong của bạn cho thấy nơi cần phát triển và hòa hợp nhất.'}
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
          <SectionHeading title="Số Thiếu & Bài Học Nghiệp" tc={tc} />
          {profile.karmicLessons.length === 0 ? (
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, color: tc.body, margin: '0 0 4px' }}>Đã có đủ các số 1–9 trong tên của bạn.</p>
              <p style={{ fontSize: 13, color: tc.muted, margin: 0 }}>Không có bài học nghiệp — rung động hoàn chỉnh.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {profile.karmicLessons.map(n => {
                const interp = interpretations[`karmic_lesson_${n}`]
                return (
                  <div key={n} style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 20 }}>
                    <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Số Thiếu</p>
                    <div style={{ fontSize: 48, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 8 }}>{n}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: tc.body, margin: '0 0 8px' }}>
                      {interp?.title ?? `Bài Học Nghiệp ${n}`}
                    </p>
                    {interp?.overview && <p style={{ fontSize: 11, color: tc.muted, lineHeight: 1.6, margin: '0 0 8px' }}>{interp.overview}</p>}
                    <p style={{ fontSize: 11, fontStyle: 'italic', color: tc.muted, margin: 0 }}>Vắng mặt trong tên khai sinh</p>
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
          <SectionHeading title="Bài Học Cuộc Đời — Nghiệp Từ Kiếp Trước" tc={tc} />
          {karmicDebtNums.length === 0 ? (
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, color: tc.body, margin: '0 0 4px' }}>Không phát hiện số nghiệp trong các chỉ số.</p>
              <p style={{ fontSize: 13, color: tc.muted, margin: 0 }}>Linh hồn bạn bước vào kiếp này không mang nghiệp.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {karmicDebtNums.map(n => {
                const interp = interpretations[`karmic_debt_${n}`]
                const [, base] = DEBT_LABELS[n] ?? [`Debt ${n}`, n % 9 || 9]
                return (
                  <div key={n} style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderLeft: `4px solid ${tc.karmicCardBorderLeft}`, borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 48, fontWeight: 700, color: tc.number, lineHeight: 1, marginBottom: 8 }}>{n}/{base}</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: tc.body, margin: '0 0 12px' }}>
                      {interp?.title ?? `Nghiệp ${n}/${base}`}
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
          <SectionHeading title="Tóm Tắt Hành Trình Cuộc Đời" tc={tc} />
          <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 16, padding: 32 }}>
            {narrative
              ? <MarkdownNarrative text={narrative} tc={tc} />
              : <p style={{ color: tc.muted }}>Nội dung bản đọc chưa có.</p>}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Annual Forecast ── */}
      <section style={{ backgroundColor: tc.altSectionBg, padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title={`Dự Báo Năm ${currentYear} & ${nextYear}`} tc={tc} />
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
                    Năm Cá Nhân {py.display}
                  </span>
                </div>

                {/* Three columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {[
                    {
                      num: py.display, numVal: py.value, sublabel: 'Năm Cá Nhân', title: info.theme,
                      interpKey: `life_path_${py.value}`,
                    },
                    {
                      num: pin?.number.display ?? '—', numVal: pin?.number.value, sublabel: 'Đỉnh Cao', title: pin?.label ?? 'Chu Kỳ Đỉnh Cao',
                      interpKey: pin ? `life_path_${pin.number.value}` : null,
                    },
                    {
                      num: ch?.number != null ? String(ch.number) : '0', numVal: ch?.number, sublabel: 'Thách Thức', title: ch?.label ?? 'Chu Kỳ Thách Thức',
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
                  <p style={{ color: tc.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Chủ Đề Chính</p>
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
          <SectionHeading title="Tóm Tắt & Hướng Đi Tương Lai" tc={tc} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* Strengths */}
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tc.heading, margin: '0 0 16px' }}>Điểm Mạnh Của Bạn</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(strengthBullets.length > 0 ? strengthBullets : [
                  'Tài năng tự nhiên của bạn tuôn chảy qua Đường Đời.',
                  'Bạn có trí tuệ độc đáo để cống hiến cho thế giới.',
                  'Linh hồn bạn mang tiềm năng sâu sắc và bền vững.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: tc.body }}>
                    <span style={{ color: '#D4AC6E', flexShrink: 0 }}>✓</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth */}
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tc.heading, margin: '0 0 16px' }}>Lĩnh Vực Cần Phát Triển</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(growthBullets.length > 0 ? growthBullets : [
                  'Đón nhận sự dễ tổn thương và cởi mở.',
                  'Cân bằng nhu cầu cá nhân với việc phục vụ người khác.',
                  'Tin tưởng vào hành trình ngay cả khi con đường chưa rõ ràng.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: tc.body }}>
                    <span style={{ color: tc.accent, flexShrink: 0 }}>○</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Path Forward */}
            <div style={{ backgroundColor: tc.cardBg, border: `1px solid ${tc.cardBorder}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tc.heading, margin: '0 0 16px' }}>Con Đường Phía Trước</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(pathBullets.length > 0 ? pathBullets : [
                  'Theo đuổi tiếng gọi của những giá trị sâu sắc nhất của bạn.',
                  'Liên kết hành động hàng ngày với mục đích linh hồn của bạn.',
                  'Tin rằng bạn đang ở đúng nơi bạn cần ở.',
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
            <h3 style={{ fontSize: 20, fontWeight: 700, color: tc.heading, margin: '0 0 24px' }}>Kết Luận Tổng Hợp</h3>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              {closingText ? (
                closingText.split('\n\n').filter(Boolean).slice(0, 2).map((p, i) => (
                  <p key={i} style={{ fontSize: 14, color: tc.body, lineHeight: 1.8, margin: '0 0 16px' }}>{p}</p>
                ))
              ) : (
                <>
                  <p style={{ fontSize: 14, color: tc.body, lineHeight: 1.8, margin: '0 0 16px' }}>
                    Với Đường Đời {profile.lifePath.display} và Vận Mệnh {profile.destiny.methodA.display}, bạn mang một bản thiết kế độc nhất cho kiếp này — sự kết hợp của tài năng, bài học và mục đích hoàn toàn là của riêng bạn.
                  </p>
                  <p style={{ fontSize: 14, color: tc.body, lineHeight: 1.8, margin: 0 }}>
                    Khi bạn trải qua Năm Cá Nhân {pyCurr.display} trong năm {currentYear}, đây là lời mời để bạn bước vào đầy đủ tiềm năng của mình. Hãy tin tưởng vào trí tuệ của các con số, đón nhận hành trình, và biết rằng mỗi bước bạn đi là một phần của kế hoạch được sắp xếp hoàn hảo.
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
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Báo Cáo Được Thực Hiện Bởi</p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, margin: '0 0 4px' }}>{practitioner.name}</p>
        {practitioner.brandingFooter && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 4px' }}>{practitioner.brandingFooter}</p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '0 0 32px' }}>{formatShort(readingData.createdAt)}</p>

        {/* ── Contact card ── */}
        {(practitioner.phone || practitioner.brandingEmail) && (
          <div style={{
            margin: '0 auto 32px',
            maxWidth: 400,
            backgroundColor: 'rgba(212,172,110,0.08)',
            border: '1px solid rgba(212,172,110,0.25)',
            borderRadius: 16,
            padding: '24px 32px',
          }}>
            <p style={{ color: 'rgba(212,172,110,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px' }}>
              LIÊN HỆ
            </p>
            {practitioner.phone ? (
              <a href={`tel:${practitioner.phone}`} style={{ display: 'block', color: '#D4AC6E', fontWeight: 700, fontSize: 18, margin: '0 0 12px', textDecoration: 'none', opacity: 1, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {practitioner.name}
              </a>
            ) : (
              <p style={{ color: '#D4AC6E', fontWeight: 700, fontSize: 18, margin: '0 0 12px' }}>
                {practitioner.name}
              </p>
            )}
            {practitioner.phone && (
              <a href={`tel:${practitioner.phone}`} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: '0 0 8px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AC6E')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              >
                📞 {formatPhone(practitioner.phone)}
              </a>
            )}
            {practitioner.brandingEmail && (
              <a href={`mailto:${practitioner.brandingEmail}`} style={{ display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none' }}>
                ✉ {practitioner.brandingEmail}
              </a>
            )}
          </div>
        )}

        <a
          href={`/api/report/${token}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', backgroundColor: '#D4AC6E', color: '#0D0D1A', fontWeight: 600, borderRadius: 12, padding: '16px 32px', fontSize: 15, textDecoration: 'none' }}
        >
          ⬇ Tải PDF
        </a>
      </footer>

    </div>
  )
}
