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
  const d = new Date(iso)
  return `${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`
}

function formatShort(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`
}

const ORDINAL_VI: Record<string, string> = {
  'First': 'Thứ Nhất',
  'Second': 'Thứ Hai',
  'Third': 'Thứ Ba',
  'Fourth (Major)': 'Thứ Tư (Chính)',
  'Fourth': 'Thứ Tư',
}

function translateOrdinalLabel(label: string | undefined, fallback: string): string {
  if (!label) return fallback
  for (const [en, vi] of Object.entries(ORDINAL_VI)) {
    if (label.startsWith(en)) return label.replace(en, vi)
  }
  return label
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
  13: ['Người Lao Động', 4],
  14: ['Nhà Phiêu Lưu', 5],
  16: ['Sự Khiêm Nhường', 7],
  19: ['Người Độc Lập', 1],
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <div style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: 'var(--gold-main)', flexShrink: 0 }} />
      <h2 style={{ color: 'var(--gold-main)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}

function NumberCard({ label, result, interp }: {
  label: string
  result: { display: string; value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean }
  interp?: Interpretation
}) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {result.isMasterNumber && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--report-master-badge-border)', backgroundColor: 'var(--report-master-badge-bg)', color: 'var(--report-master-badge-text)' }}>
              S&#7889; Master
            </span>
          )}
          {result.isKarmicDebt && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--report-karmic-badge-border)', backgroundColor: 'var(--report-karmic-badge-bg)', color: 'var(--report-karmic-badge-text)' }}>
              S&#7889; Nghi&#7879;p
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--gold-main)', lineHeight: 1, marginBottom: 8 }}>{result.display}</div>
      {interp?.title && <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>{interp.title}</p>}
      {interp?.overview && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{interp.overview}</p>
      )}
    </div>
  )
}

function MarkdownNarrative({ text }: { text: string }) {
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
              <h2 style={{ color: 'var(--gold-main)', fontSize: 17, fontWeight: 500, marginTop: 32, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                {heading}
              </h2>
            )}
            {paras.map((p, j) => (
              <p key={j} style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{p}</p>
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [reportLang, setReportLang] = useState('vi')

  useEffect(() => {
    const saved = localStorage.getItem('report-theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      // Ensure default dark theme is set on mount
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('report-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const interpretations = reportLang === 'en' ? interpretations_en : interpretations_vi
  const narrative = readingData.editedNarrative ?? readingData.aiNarrative ?? ''

  const CORE_CARDS = [
    { key: 'lifePath', label: '\u0110\u01B0\u1EDDng \u0110\u1EDDi', result: profile.lifePath },
    { key: 'destiny', label: 'V\u1EADn M\u1EC7nh', result: profile.destiny.methodA },
    { key: 'soul', label: 'Linh H\u1ED3n', result: profile.soul.methodA },
    { key: 'personality', label: 'Nh\u00E2n C\u00E1ch', result: profile.personality.methodA },
    { key: 'maturity', label: 'Tr\u01B0\u1EDFng Th\u00E0nh', result: profile.maturity },
    { key: 'birthDay', label: 'Ng\u00E0y Sinh', result: profile.birthDay },
    { key: 'currentName', label: 'T\u00EAn Hi\u1EC7n T\u1EA1i', result: profile.currentName },
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

  const S_DIVIDER = { borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }

  return (
    <div style={{ backgroundColor: 'var(--report-section-bg)', minHeight: '100vh' }}>

      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 50,
          padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          backgroundColor: 'var(--report-toggle-bg)', color: 'var(--report-toggle-text)', border: '1px solid var(--report-toggle-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {theme === 'dark' ? '\u2600 S\u00E1ng' : '\uD83C\uDF19 T\u1ED1i'}
      </button>

      {/* ── Language toggle ── */}
      <button
        onClick={() => setReportLang(l => l === 'vi' ? 'en' : 'vi')}
        style={{
          position: 'fixed', top: 16, right: 120, zIndex: 50,
          padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          backgroundColor: reportLang === 'vi' ? 'rgba(255,255,255,0.12)' : 'var(--report-accent)',
          color: reportLang === 'vi' ? 'var(--report-toggle-text)' : 'var(--bg-card)',
          border: `1px solid ${reportLang === 'vi' ? 'var(--report-toggle-border)' : 'var(--report-accent)'}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {reportLang === 'vi' ? '🌐 ENG' : '🌐 TIẾNG VIỆT'}
      </button>

      {/* ── HEADER ── */}
      <header style={{
        backgroundColor: 'var(--report-header-bg)',
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
            B\u1EA3n \u0111\u1ECDc b\u1EDFi {practitioner.name}
          </p>

          {/* Decorative number badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {CORE_CARDS.map(({ key, result }) => (
              <div key={key} style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--gold-main)',
                backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,172,110,0.3)',
              }}>
                {result.display.split('/')[0]}
              </div>
            ))}
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--gold-main)', margin: '0 0 12px' }}>
            {[clientData.lastName, clientData.middleName, clientData.firstName].filter(Boolean).join(' ')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 6px' }}>
            Sinh ng\u00E0y {formatLong(clientData.dateOfBirth)}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
            B\u1EA3n \u0111\u1ECDc \u0111\u01B0\u1EE3c l\u1EADp {formatShort(readingData.createdAt)}
          </p>
        </div>
      </header>

      {/* ── SECTION 1: Key Indicators ── */}
      <section style={{ backgroundColor: 'var(--report-section-bg)', padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Ch\u1EC9 S\u1ED1 Ch\u00EDnh" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {CORE_CARDS.map(({ key, label, result }) => (
              <NumberCard key={key} label={label} result={result} interp={interpretations[getNumberKey(result)]} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Name Index & Isolation Number ── */}
      <section style={{ backgroundColor: 'var(--report-alt-section-bg)', padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="Ch\u1EC9 S\u1ED1 T\u00EAn & S\u1ED1 C\u00F4 L\u1EADp" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Ch\u1EC9 S\u1ED1 T\u00EAn — S\u1ED1 V\u1EADn M\u1EC7nh</p>
              <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--gold-main)', lineHeight: 1, marginBottom: 12 }}>{profile.destiny.methodA.display}</div>
              {destinyInterp?.title && <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>{destinyInterp.title}</p>}
              {destinyInterp?.overview && <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, margin: 0 }}>{destinyInterp.overview}</p>}
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>S\u1ED1 C\u00F4 L\u1EADp</p>
              <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--gold-main)', lineHeight: 1, marginBottom: 12 }}>
                {isolationNumber === 0 ? '\u221E' : isolationNumber}
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                {isolationNumber === 0 ? 'H\u00F2a H\u1EE3p Ho\u00E0n H\u1EA3o' : `\u0110i\u1EC3m K\u1EBFt H\u1EE3p ${isolationNumber}`}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 12px' }}>
                {isolationNumber === 0
                  ? 'V\u1EADn m\u1EC7nh b\u00EAn ngo\u00E0i v\u00E0 linh h\u1ED3n b\u00EAn trong c\u1EE7a b\u1EA1n ho\u00E0n to\u00E0n h\u00F2a h\u1EE3p — m\u1ED9t s\u1EF1 k\u1EBFt h\u1EE3p hi\u1EBFm c\u00F3 v\u00E0 m\u1EA1nh m\u1EBD gi\u1EEFa m\u1EE5c \u0111\u00EDch v\u00E0 khao kh\u00E1t.'
                  : 'Kho\u1EA3ng c\u00E1ch gi\u1EEFa v\u1EADn m\u1EC7nh b\u00EAn ngo\u00E0i v\u00E0 linh h\u1ED3n b\u00EAn trong c\u1EE7a b\u1EA1n cho th\u1EA5y n\u01A1i c\u1EA7n ph\u00E1t tri\u1EC3n v\u00E0 h\u00F2a h\u1EE3p nh\u1EA5t.'}
              </p>
              {isolationNumber > 0 && interpretations[`life_path_${isolationNumber}`]?.overview && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  {interpretations[`life_path_${isolationNumber}`].overview?.slice(0, 200)}…
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: Missing Numbers & Karmic Lessons ── */}
      <section style={{ backgroundColor: 'var(--report-section-bg)', padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="S\u1ED1 Thi\u1EBFu & B\u00E0i H\u1ECDc Nghi\u1EC7p" />
          {profile.karmicLessons.length === 0 ? (
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>\u0110\u00E3 c\u00F3 \u0111\u1EE7 c\u00E1c s\u1ED1 1\u20139 trong t\u00EAn c\u1EE7a b\u1EA1n.</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Kh\u00F4ng c\u00F3 b\u00E0i h\u1ECDc nghi\u1EC7p — rung \u0111\u1ED9ng ho\u00E0n ch\u1EC9nh.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {profile.karmicLessons.map(n => {
                const interp = interpretations[`karmic_lesson_${n}`]
                return (
                  <div key={n} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>S\u1ED1 Thi\u1EBFu</p>
                    <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--gold-main)', lineHeight: 1, marginBottom: 8 }}>{n}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                      {interp?.title ?? `B\u00E0i H\u1ECDc Nghi\u1EC7p ${n}`}
                    </p>
                    {interp?.overview && <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 8px' }}>{interp.overview}</p>}
                    <p style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-muted)', margin: 0 }}>V\u1EAFng m\u1EB7t trong t\u00EAn khai sinh</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: Life Lessons — Karma from Past Lives ── */}
      <section style={{ backgroundColor: 'var(--report-alt-section-bg)', padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="B\u00E0i H\u1ECDc Cu\u1ED9c \u0110\u1EDDi — Nghi\u1EC7p T\u1EEB Ki\u1EBFp Tr\u01B0\u1EDBc" />
          {karmicDebtNums.length === 0 ? (
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>Kh\u00F4ng ph\u00E1t hi\u1EC7n s\u1ED1 nghi\u1EC7p trong c\u00E1c ch\u1EC9 s\u1ED1.</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Linh h\u1ED3n b\u1EA1n b\u01B0\u1EDBc v\u00E0o ki\u1EBFp n\u00E0y kh\u00F4ng mang nghi\u1EC7p.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {karmicDebtNums.map(n => {
                const interp = interpretations[`karmic_debt_${n}`]
                const [, base] = DEBT_LABELS[n] ?? [`Debt ${n}`, n % 9 || 9]
                return (
                  <div key={n} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--report-karmic-border-left)', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--gold-main)', lineHeight: 1, marginBottom: 8 }}>{n}/{base}</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                      {interp?.title ?? `Nghi\u1EC7p ${n}/${base}`}
                    </p>
                    {interp?.overview && <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, margin: 0 }}>{interp.overview}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 5: Summary of Life's Journey ── */}
      <section style={{ backgroundColor: 'var(--report-section-bg)', padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="T\u00F3m T\u1EAFt H\u00E0nh Tr\u00ECnh Cu\u1ED9c \u0110\u1EDDi" />
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 32 }}>
            {narrative
              ? <MarkdownNarrative text={narrative} />
              : <p style={{ color: 'var(--text-muted)' }}>N\u1ED9i dung b\u1EA3n \u0111\u1ECDc ch\u01B0a c\u00F3.</p>}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Annual Forecast ── */}
      <section style={{ backgroundColor: 'var(--report-alt-section-bg)', padding: '64px 16px', ...S_DIVIDER }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title={`D\u1EF1 B\u00E1o N\u0103m ${currentYear} & ${nextYear}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {([
              { year: currentYear, py: pyCurr, info: pyCurrInfo, pin: pinCurr, ch: chCurr },
              { year: nextYear, py: pyNext, info: pyNextInfo, pin: pinNext, ch: chNext },
            ] as const).map(({ year, py, info, pin, ch }) => (
              <div key={year} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>

                {/* Year header */}
                <div style={{ backgroundColor: 'var(--report-forecast-header-bg)', borderBottom: '1px solid var(--border-subtle)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold-main)' }}>{year}</span>
                  <span style={{ fontSize: 13, padding: '6px 16px', borderRadius: 99, fontWeight: 600, backgroundColor: 'var(--report-theme-pill-bg)', color: 'var(--report-theme-pill-text)', border: '1px solid var(--report-theme-pill-border)' }}>
                    N\u0103m C\u00E1 Nh\u00E2n {py.display}
                  </span>
                </div>

                {/* Three columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {[
                    {
                      num: py.display, numVal: py.value, sublabel: 'N\u0103m C\u00E1 Nh\u00E2n', title: info.theme,
                      interpKey: `life_path_${py.value}`,
                    },
                    {
                      num: pin?.number.display ?? '—', numVal: pin?.number.value, sublabel: '\u0110\u1EC9nh Cao', title: translateOrdinalLabel(pin?.label, 'Chu K\u1EF3 \u0110\u1EC9nh Cao'),
                      interpKey: pin ? `life_path_${pin.number.value}` : null,
                    },
                    {
                      num: ch?.number != null ? String(ch.number) : '0', numVal: ch?.number, sublabel: 'Th\u00E1ch Th\u1EE9c', title: translateOrdinalLabel(ch?.label, 'Chu K\u1EF3 Th\u00E1ch Th\u1EE9c'),
                      interpKey: ch?.number != null ? `life_path_${ch.number}` : null,
                    },
                  ].map((col, ci) => (
                    <div key={ci} style={{ padding: 24, borderRight: ci < 2 ? '1px solid var(--border-subtle)' : undefined }}>
                      <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--gold-main)', lineHeight: 1, marginBottom: 8 }}>{col.num}</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>{col.sublabel}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>{col.title}</p>
                      {col.interpKey && interpretations[col.interpKey]?.overview && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                          {interpretations[col.interpKey]!.overview!.slice(0, 140)}…
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key themes */}
                <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border-subtle)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Ch\u1EE7 \u0110\u1EC1 Ch\u00EDnh</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {info.bullets.map((b, i) => (
                      <span key={i} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 99, backgroundColor: 'var(--report-tag-bg)', color: 'var(--report-tag-text)', border: '1px solid var(--report-tag-border)' }}>
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
      <section style={{ backgroundColor: 'var(--report-section-bg)', padding: '64px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionHeading title="T\u00F3m T\u1EAFt & H\u01B0\u1EDBng \u0110i T\u01B0\u01A1ng Lai" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* Strengths */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-main)', margin: '0 0 16px' }}>\u0110i\u1EC3m M\u1EA1nh C\u1EE7a B\u1EA1n</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(strengthBullets.length > 0 ? strengthBullets : [
                  'T\u00E0i n\u0103ng t\u1EF1 nhi\u00EAn c\u1EE7a b\u1EA1n tu\u00F4n ch\u1EA3y qua \u0110\u01B0\u1EDDng \u0110\u1EDDi.',
                  'B\u1EA1n c\u00F3 tr\u00ED tu\u1EC7 \u0111\u1ED9c \u0111\u00E1o \u0111\u1EC3 c\u1ED1ng hi\u1EBFn cho th\u1EBF gi\u1EDBi.',
                  'Linh h\u1ED3n b\u1EA1n mang ti\u1EC1m n\u0103ng s\u00E2u s\u1EAFc v\u00E0 b\u1EC1n v\u1EEFng.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--gold-main)', flexShrink: 0 }}>✓</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-main)', margin: '0 0 16px' }}>L\u0129nh V\u1EF1c C\u1EA7n Ph\u00E1t Tri\u1EC3n</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(growthBullets.length > 0 ? growthBullets : [
                  '\u0110\u00F3n nh\u1EADn s\u1EF1 d\u1EC5 t\u1ED5n th\u01B0\u01A1ng v\u00E0 c\u1EDFi m\u1EDF.',
                  'C\u00E2n b\u1EB1ng nhu c\u1EA7u c\u00E1 nh\u00E2n v\u1EDBi vi\u1EC7c ph\u1EE5c v\u1EE5 ng\u01B0\u1EDDi kh\u00E1c.',
                  'Tin t\u01B0\u1EDFng v\u00E0o h\u00E0nh tr\u00ECnh ngay c\u1EA3 khi con \u0111\u01B0\u1EDDng ch\u01B0a r\u00F5 r\u00E0ng.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--report-accent)', flexShrink: 0 }}>○</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Path Forward */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-main)', margin: '0 0 16px' }}>Con \u0110\u01B0\u1EDDng Ph\u00EDa Tr\u01B0\u1EDBc</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(pathBullets.length > 0 ? pathBullets : [
                  'Theo \u0111u\u1ED5i ti\u1EBFng g\u1ECDi c\u1EE7a nh\u1EEFng gi\u00E1 tr\u1ECB s\u00E2u s\u1EAFc nh\u1EA5t c\u1EE7a b\u1EA1n.',
                  'Li\u00EAn k\u1EBFt h\u00E0nh \u0111\u1ED9ng h\u00E0ng ng\u00E0y v\u1EDBi m\u1EE5c \u0111\u00EDch linh h\u1ED3n c\u1EE7a b\u1EA1n.',
                  'Tin r\u1EB1ng b\u1EA1n \u0111ang \u1EDF \u0111\u00FAng n\u01A1i b\u1EA1n c\u1EA7n \u1EDF.',
                ]).slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--report-accent)', flexShrink: 0 }}>\u2192</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Summary Conclusion */}
          <div style={{ backgroundColor: 'var(--report-summary-bg)', border: '1px solid var(--report-summary-border)', borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✨</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-main)', margin: '0 0 24px' }}>K\u1EBFt Lu\u1EADn T\u1ED5ng H\u1EE3p</h3>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              {closingText ? (
                closingText.split('\n\n').filter(Boolean).slice(0, 2).map((p, i) => (
                  <p key={i} style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 16px' }}>{p}</p>
                ))
              ) : (
                <>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 16px' }}>
                    V\u1EDBi \u0110\u01B0\u1EDDng \u0110\u1EDDi {profile.lifePath.display} v\u00E0 V\u1EADn M\u1EC7nh {profile.destiny.methodA.display}, b\u1EA1n mang m\u1ED9t b\u1EA3n thi\u1EBFt k\u1EBF \u0111\u1ED9c nh\u1EA5t cho ki\u1EBFp n\u00E0y — s\u1EF1 k\u1EBFt h\u1EE3p c\u1EE7a t\u00E0i n\u0103ng, b\u00E0i h\u1ECDc v\u00E0 m\u1EE5c \u0111\u00EDch ho\u00E0n to\u00E0n l\u00E0 c\u1EE7a ri\u00EAng b\u1EA1n.
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: 0 }}>
                    Khi b\u1EA1n tr\u1EA3i qua N\u0103m C\u00E1 Nh\u00E2n {pyCurr.display} trong n\u0103m {currentYear}, \u0111\u00E2y l\u00E0 l\u1EDDi m\u1EDDi \u0111\u1EC3 b\u1EA1n b\u01B0\u1EDBc v\u00E0o \u0111\u1EA7y \u0111\u1EE7 ti\u1EC1m n\u0103ng c\u1EE7a m\u00ECnh. H\u00E3y tin t\u01B0\u1EDFng v\u00E0o tr\u00ED tu\u1EC7 c\u1EE7a c\u00E1c con s\u1ED1, \u0111\u00F3n nh\u1EADn h\u00E0nh tr\u00ECnh, v\u00E0 bi\u1EBFt r\u1EB1ng m\u1ED7i b\u01B0\u1EDBc b\u1EA1n \u0111i l\u00E0 m\u1ED9t ph\u1EA7n c\u1EE7a k\u1EBF ho\u1EA1ch \u0111\u01B0\u1EE3c s\u1EAFp x\u1EBFp ho\u00E0n h\u1EA3o.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: 'var(--report-footer-bg)', borderTop: '1px solid var(--report-footer-border)', padding: '48px 16px', textAlign: 'center' }}>
        {practitioner.logoUrl && (
          <img src={practitioner.logoUrl} alt={practitioner.name}
            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '1px solid rgba(255,255,255,0.2)' }} />
        )}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>B\u00E1o C\u00E1o \u0110\u01B0\u1EE3c Th\u1EF1c Hi\u1EC7n B\u1EDFi</p>
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
              LI\u00CAN H\u1EC6
            </p>
            {practitioner.phone ? (
              <a href={`tel:${practitioner.phone}`} style={{ display: 'block', color: 'var(--gold-main)', fontWeight: 700, fontSize: 18, margin: '0 0 12px', textDecoration: 'none', opacity: 1, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {practitioner.name}
              </a>
            ) : (
              <p style={{ color: 'var(--gold-main)', fontWeight: 700, fontSize: 18, margin: '0 0 12px' }}>
                {practitioner.name}
              </p>
            )}
            {practitioner.phone && (
              <a href={`tel:${practitioner.phone}`} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: '0 0 8px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-main)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              >
                \uD83D\uDCDE {formatPhone(practitioner.phone)}
              </a>
            )}
            {practitioner.brandingEmail && (
              <a href={`mailto:${practitioner.brandingEmail}`} style={{ display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none' }}>
                \u2709 {practitioner.brandingEmail}
              </a>
            )}
          </div>
        )}

        <a
          href={`/api/report/${token}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', backgroundColor: 'var(--gold-main)', color: 'var(--report-section-bg)', fontWeight: 600, borderRadius: 12, padding: '16px 32px', fontSize: 15, textDecoration: 'none' }}
        >
          \u2B07 T\u1EA3i PDF
        </a>
      </footer>

    </div>
  )
}
