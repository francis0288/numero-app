import React from 'react'
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { NumerologyProfile, ForecastProfile } from '@numero-app/core'

// ── Dark Cosmic Palette ────────────────────────────────────────────────────────
const C = {
  pageBg: '#0D0D1A',
  cardBg: '#1A1A2E',
  cardBorder: '#2D2D4E',
  gold: '#D4AC6E',
  body: '#C8C8D4',
  muted: '#888899',
  violet: '#7B5EA7',
  red: '#ef4444',
  amber: '#f97316',
}

const styles = StyleSheet.create({
  page: { backgroundColor: C.pageBg, padding: 0, fontSize: 10, color: C.body },
  cover: { backgroundColor: '#1A1A2E', minHeight: '100%', padding: 60, alignItems: 'center', justifyContent: 'center' },
  coverPractitioner: { fontSize: 10, color: 'rgba(212,172,110,0.7)', marginBottom: 32, textAlign: 'center' },
  coverName: { fontSize: 30, color: C.gold, fontWeight: 700, textAlign: 'center', marginBottom: 10 },
  coverSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 6 },
  coverDate: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
  logoImg: { width: 56, height: 56, borderRadius: 28, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(212,172,110,0.3)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9, color: C.gold, fontWeight: 700 },
  section: { padding: '32pt 40pt' },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionHeadingBar: { width: 3, height: 18, borderRadius: 2, backgroundColor: C.gold },
  sectionHeadingText: { fontSize: 9, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 },
  card: { backgroundColor: C.cardBg, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  cardHalf: { flex: 1, backgroundColor: C.cardBg, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 8, padding: 14 },
  karmicCard: { flex: 1, backgroundColor: C.cardBg, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 8, padding: 14, borderLeftColor: C.red, borderLeftWidth: 3 },
  numGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  numCard: { width: '30.5%', backgroundColor: C.cardBg, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12 },
  label: { fontSize: 7.5, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  bigNum: { fontSize: 34, color: C.gold, fontWeight: 700, lineHeight: 1, marginBottom: 5 },
  medNum: { fontSize: 24, color: C.gold, fontWeight: 700, lineHeight: 1, marginBottom: 4 },
  smallNum: { fontSize: 18, color: C.gold, fontWeight: 700, lineHeight: 1, marginBottom: 4 },
  cardTitle: { fontSize: 10, color: C.body, fontWeight: 700, marginBottom: 5 },
  bodyText: { fontSize: 9.5, color: C.body, lineHeight: 1.7, marginBottom: 6 },
  mutedText: { fontSize: 8.5, color: C.muted, lineHeight: 1.6 },
  italic: { fontSize: 8, color: C.muted, fontStyle: 'italic' },
  masterBadge: { fontSize: 7, color: C.gold, borderColor: C.gold, borderWidth: 1, borderRadius: 99, paddingHorizontal: 5, paddingVertical: 2 },
  karmicBadge: { fontSize: 7, color: C.red, borderColor: C.red, borderWidth: 1, borderRadius: 99, paddingHorizontal: 5, paddingVertical: 2 },
  forecastCard: { backgroundColor: C.cardBg, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 10, marginBottom: 16, overflow: 'hidden' },
  forecastHeader: { backgroundColor: '#12122A', padding: '12pt 18pt', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: C.cardBorder, borderBottomWidth: 1 },
  forecastYear: { fontSize: 22, color: C.gold, fontWeight: 700 },
  forecastPill: { fontSize: 8, color: C.gold, borderColor: 'rgba(212,172,110,0.35)', borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(212,172,110,0.12)' },
  forecastCols: { flexDirection: 'row' },
  forecastCol: { flex: 1, padding: '12pt 14pt', borderRightColor: C.cardBorder, borderRightWidth: 1 },
  forecastColLast: { flex: 1, padding: '12pt 14pt' },
  forecastThemes: { padding: '10pt 14pt', borderTopColor: C.cardBorder, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { fontSize: 7.5, color: '#9B7DC8', borderColor: 'rgba(123,94,167,0.3)', borderWidth: 1, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: 'rgba(123,94,167,0.12)' },
  conclusionBox: { backgroundColor: 'rgba(123,94,167,0.2)', borderColor: 'rgba(123,94,167,0.4)', borderWidth: 1, borderRadius: 10, padding: 20, marginTop: 10, alignItems: 'center' },
  conclusionHeading: { fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 12, textAlign: 'center' },
  threeCardRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: C.cardBg, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12 },
  summaryCardTitle: { fontSize: 9, color: C.gold, fontWeight: 700, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  bulletIcon: { fontSize: 9, color: C.gold, width: 10 },
  bulletIconAmber: { fontSize: 9, color: C.amber, width: 10 },
  bulletIconViolet: { fontSize: 9, color: C.violet, width: 10 },
  bulletText: { fontSize: 8.5, color: C.body, lineHeight: 1.5, flex: 1 },
  narrativeHeading: { fontSize: 11, color: C.gold, fontWeight: 700, marginTop: 14, marginBottom: 6, paddingBottom: 4, borderBottomColor: C.cardBorder, borderBottomWidth: 1 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#080810', borderTopColor: C.cardBorder, borderTopWidth: 1, padding: '10pt 40pt', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7.5, color: 'rgba(255,255,255,0.35)' },
})

// ── Helpers ────────────────────────────────────────────────────────────────────

function getNumberKey(r: { value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean; karmicDebtNumber?: number }) {
  if (r.isKarmicDebt && r.karmicDebtNumber) return `karmic_debt_${r.karmicDebtNumber}`
  if (r.isMasterNumber) return `master_${r.value}`
  return `life_path_${r.value}`
}

function formatLong(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShort(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function parseSections(text: string) {
  return text.split(/\n(?=## )/).map(s => {
    const lines = s.split('\n')
    const heading = lines[0].replace(/^## /, '').trim()
    const paras = lines.slice(1).join('\n').trim().split(/\n\n+/).filter(Boolean)
    return { heading, paras }
  })
}

function sentences(text: string | undefined, n = 3): string[] {
  if (!text) return []
  return (text.match(/[^.!?]+[.!?]+/g) ?? []).map(s => s.trim()).filter(s => s.length > 10).slice(0, n)
}

function extractClosing(narrative: string): string[] {
  const parts = narrative.split(/\n(?=## )/)
  const closing = parts.find(s => /closing|conclusion|forward|guidance/i.test(s.split('\n')[0])) ?? parts[parts.length - 1]
  if (!closing) return []
  return closing.split('\n').slice(1).join('\n').trim().split(/\n\n+/).filter(Boolean).slice(0, 2)
}

const DEBT_LABELS: Record<number, [string, number]> = {
  13: ['The Hard Worker', 4],
  14: ['The Adventurer', 5],
  16: ['The Humbling', 7],
  19: ['The Independent', 1],
}

const PY_INFO: Record<number, { theme: string; bullets: string[] }> = {
  1: { theme: 'New Beginnings & Independence', bullets: ['Plant seeds for the next 9-year cycle', 'Assert independence and leadership', 'Launch new projects and initiatives'] },
  2: { theme: 'Partnership & Patience', bullets: ['Nurture key relationships', 'Practice diplomacy and sensitivity', 'Trust the slow and steady unfolding'] },
  3: { theme: 'Creativity & Expression', bullets: ['Let creative gifts flow freely', 'Expand social connections and joy', 'Speak truth with confidence'] },
  4: { theme: 'Work, Order & Foundation', bullets: ['Build solid long-term structures', 'Focus on practical planning', 'Lay the groundwork for future growth'] },
  5: { theme: 'Change, Freedom & Adventure', bullets: ['Embrace change and new experiences', 'Release what no longer serves', 'Explore new horizons'] },
  6: { theme: 'Home, Responsibility & Healing', bullets: ['Prioritise family and community', 'Offer gifts in service to others', 'Create beauty and harmony'] },
  7: { theme: 'Reflection, Study & Inner Wisdom', bullets: ['Retreat inward for deep reflection', 'Pursue spiritual growth', 'Trust intuition over external noise'] },
  8: { theme: 'Achievement, Power & Abundance', bullets: ['Step into personal power', 'Pursue ambitious goals', 'Lead with integrity and strength'] },
  9: { theme: 'Completion, Release & Compassion', bullets: ['Complete unfinished cycles with grace', 'Release the old to welcome the new', 'Serve humanity with an expanded heart'] },
  11: { theme: 'Illumination & Spiritual Mastery', bullets: ['Heighten intuition and spiritual awareness', 'Inspire others through your light', 'Balance the spiritual with the practical'] },
  22: { theme: 'Mastery & Large-Scale Building', bullets: ['Realise your most ambitious visions', 'Build lasting legacies', 'Lead transformative projects'] },
}

function SecHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionHeadingBar} />
      <Text style={styles.sectionHeadingText}>{title}</Text>
    </View>
  )
}

function Footer({ name, clientName }: { name: string; clientName: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{clientName} · Numerology Reading by {name}</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </View>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ReadingPDFProps {
  client: { firstName: string; lastName: string; dateOfBirth: string | Date }
  reading: { createdAt: string | Date; aiNarrative?: string | null; editedNarrative?: string | null }
  profile: NumerologyProfile
  forecastCurr: ForecastProfile
  forecastNext: ForecastProfile
  currentYear: number
  nextYear: number
  interpretations: Record<string, { title?: string; overview?: string; [k: string]: unknown }>
  practitioner: { name: string; logoUrl?: string | null; brandingFooter?: string | null }
  karmicDebtNums: number[]
  isolationNumber: number
}

// ── Main PDF ───────────────────────────────────────────────────────────────────

export function ReadingPDF({
  client: cl, reading, profile, forecastCurr, forecastNext, currentYear, nextYear,
  interpretations: interps, practitioner, karmicDebtNums, isolationNumber,
}: ReadingPDFProps) {
  const narrative = reading.editedNarrative ?? reading.aiNarrative ?? ''
  const clientName = `${cl.firstName} ${cl.lastName}`

  const CORE = [
    { key: 'lifePath', label: 'Life Path', r: profile.lifePath },
    { key: 'destiny', label: 'Destiny', r: profile.destiny.methodA },
    { key: 'soul', label: 'Soul', r: profile.soul.methodA },
    { key: 'personality', label: 'Personality', r: profile.personality.methodA },
    { key: 'maturity', label: 'Maturity', r: profile.maturity },
    { key: 'birthDay', label: 'Birth Day', r: profile.birthDay },
    { key: 'currentName', label: 'Current Name', r: profile.currentName },
  ]

  const lifePathInterp = interps[getNumberKey(profile.lifePath)]
  const destinyInterp = interps[getNumberKey(profile.destiny.methodA)]
  const pyCurr = forecastCurr.personalYear
  const pyNext = forecastNext.personalYear
  const pyCurrInfo = PY_INFO[pyCurr.value] ?? PY_INFO[1]
  const pyNextInfo = PY_INFO[pyNext.value] ?? PY_INFO[1]
  const pinCurr = forecastCurr.pinnacles.find(p => p.isCurrent)
  const chCurr = forecastCurr.challenges.find(c => c.isCurrent)
  const pinNext = forecastNext.pinnacles.find(p => p.isCurrent)
  const chNext = forecastNext.challenges.find(c => c.isCurrent)

  const strengthBullets = sentences(lifePathInterp?.overview, 3)
  const growthBullets = sentences(lifePathInterp?.overview, 6).slice(3)
  const pathBullets = [...sentences(lifePathInterp?.overview, 9).slice(6, 8), ...sentences(destinyInterp?.overview, 1)]
  const closingParas = narrative ? extractClosing(narrative) : []

  return (
    <Document>

      {/* ── PAGE 1: Cover ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          {practitioner.logoUrl && <Image src={practitioner.logoUrl} style={styles.logoImg} />}
          <Text style={styles.coverPractitioner}>A reading by {practitioner.name}</Text>
          <View style={styles.badgeRow}>
            {CORE.map(({ key, r }) => (
              <View key={key} style={styles.badge}>
                <Text style={styles.badgeText}>{r.display.split('/')[0]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.coverName}>{clientName}</Text>
          <Text style={styles.coverSub}>Numerology Reading</Text>
          <Text style={styles.coverDate}>Born on {formatLong(cl.dateOfBirth)}</Text>
          <Text style={{ ...styles.coverDate, marginTop: 6 }}>Reading prepared {formatShort(reading.createdAt)}</Text>
        </View>
        <Footer name={practitioner.name} clientName={clientName} />
      </Page>

      {/* ── PAGE 2: Key Indicators ── */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, paddingBottom: 48 }}>
          <SecHeading title="Key Indicators" />
          <View style={styles.numGrid}>
            {CORE.map(({ key, label, r }) => {
              const interp = interps[getNumberKey(r)]
              return (
                <View key={key} style={styles.numCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={{ flexDirection: 'row', gap: 3 }}>
                      {r.isMasterNumber && <Text style={styles.masterBadge}>Master</Text>}
                      {r.isKarmicDebt && <Text style={styles.karmicBadge}>Karmic</Text>}
                    </View>
                  </View>
                  <Text style={styles.smallNum}>{r.display}</Text>
                  {interp?.title && <Text style={styles.cardTitle}>{interp.title}</Text>}
                  {interp?.overview && <Text style={styles.mutedText}>{interp.overview.slice(0, 80)}…</Text>}
                </View>
              )
            })}
          </View>
        </View>
        <Footer name={practitioner.name} clientName={clientName} />
      </Page>

      {/* ── PAGE 3: Name Index + Isolation + Missing + Karmic Debt ── */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, paddingBottom: 48 }}>
          <SecHeading title="Name Index & Isolation Number" />
          <View style={styles.cardRow}>
            <View style={styles.cardHalf}>
              <Text style={styles.label}>Name Index — Destiny Number</Text>
              <Text style={styles.bigNum}>{profile.destiny.methodA.display}</Text>
              {destinyInterp?.title && <Text style={styles.cardTitle}>{destinyInterp.title}</Text>}
              {destinyInterp?.overview && <Text style={styles.bodyText}>{destinyInterp.overview.slice(0, 280)}…</Text>}
            </View>
            <View style={styles.cardHalf}>
              <Text style={styles.label}>Isolation Number</Text>
              <Text style={styles.bigNum}>{isolationNumber === 0 ? '∞' : isolationNumber}</Text>
              <Text style={styles.cardTitle}>{isolationNumber === 0 ? 'Perfect Integration' : `Integration Point ${isolationNumber}`}</Text>
              <Text style={styles.bodyText}>
                {isolationNumber === 0
                  ? 'Your outer destiny and inner soul are perfectly aligned — a rare and powerful integration.'
                  : 'The gap between your outer destiny and inner soul reveals where growth and integration are needed most.'}
              </Text>
              {isolationNumber > 0 && interps[`life_path_${isolationNumber}`]?.overview && (
                <Text style={styles.mutedText}>{interps[`life_path_${isolationNumber}`].overview?.slice(0, 160)}…</Text>
              )}
            </View>
          </View>

          <SecHeading title="Missing Numbers & Karmic Lessons" />
          {profile.karmicLessons.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>All numbers 1–9 present in your name. No karmic lessons. ✓</Text>
            </View>
          ) : (
            <View style={styles.numGrid}>
              {profile.karmicLessons.map(n => {
                const interp = interps[`karmic_lesson_${n}`]
                return (
                  <View key={n} style={styles.numCard}>
                    <Text style={styles.label}>Missing Number</Text>
                    <Text style={styles.smallNum}>{n}</Text>
                    <Text style={styles.cardTitle}>{interp?.title ?? `Karmic Lesson ${n}`}</Text>
                    {interp?.overview && <Text style={styles.mutedText}>{interp.overview.slice(0, 100)}…</Text>}
                    <Text style={styles.italic}>Absent from birth name</Text>
                  </View>
                )
              })}
            </View>
          )}

          <SecHeading title="Life Lessons — Karma from Past Lives" />
          {karmicDebtNums.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No karmic debt numbers detected. Clean slate. ✓</Text>
            </View>
          ) : (
            <View style={styles.cardRow}>
              {karmicDebtNums.map(n => {
                const interp = interps[`karmic_debt_${n}`]
                const [lbl, base] = DEBT_LABELS[n] ?? [`Debt ${n}`, n % 9 || 9]
                return (
                  <View key={n} style={styles.karmicCard}>
                    <Text style={styles.label}>Karmic Debt</Text>
                    <Text style={styles.medNum}>{n}/{base}</Text>
                    <Text style={styles.cardTitle}>{interp?.title ?? `Karmic Debt ${n}/${base} — ${lbl}`}</Text>
                    {interp?.overview && <Text style={styles.bodyText}>{interp.overview.slice(0, 220)}…</Text>}
                  </View>
                )
              })}
            </View>
          )}
        </View>
        <Footer name={practitioner.name} clientName={clientName} />
      </Page>

      {/* ── PAGE 4+: Summary of Life's Journey (auto-wraps) ── */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, paddingBottom: 48 }}>
          <SecHeading title="Summary of Life's Journey" />
          {narrative ? (
            parseSections(narrative).map((sec, i) => (
              <View key={i} wrap>
                {sec.heading && <Text style={styles.narrativeHeading}>{sec.heading}</Text>}
                {sec.paras.map((p, j) => <Text key={j} style={styles.bodyText}>{p}</Text>)}
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>Reading content not available.</Text>
          )}
        </View>
        <Footer name={practitioner.name} clientName={clientName} />
      </Page>

      {/* ── FINAL PAGE: Annual Forecast + Summary ── */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, paddingBottom: 48 }}>
          <SecHeading title="Annual Forecast" />

          {([
            { year: currentYear, py: pyCurr, info: pyCurrInfo, pin: pinCurr, ch: chCurr },
            { year: nextYear, py: pyNext, info: pyNextInfo, pin: pinNext, ch: chNext },
          ] as const).map(({ year, py, info, pin, ch }) => (
            <View key={year} style={styles.forecastCard} wrap={false}>
              <View style={styles.forecastHeader}>
                <Text style={styles.forecastYear}>{year}</Text>
                <Text style={styles.forecastPill}>Personal Year {py.display}</Text>
              </View>
              <View style={styles.forecastCols}>
                <View style={styles.forecastCol}>
                  <Text style={styles.label}>Personal Year</Text>
                  <Text style={styles.medNum}>{py.display}</Text>
                  <Text style={styles.cardTitle}>{info.theme}</Text>
                  {interps[`life_path_${py.value}`]?.overview && (
                    <Text style={styles.mutedText}>{interps[`life_path_${py.value}`].overview?.slice(0, 100)}…</Text>
                  )}
                </View>
                <View style={styles.forecastCol}>
                  <Text style={styles.label}>Pinnacle</Text>
                  <Text style={styles.medNum}>{pin?.number.display ?? '—'}</Text>
                  <Text style={styles.cardTitle}>{pin?.label ?? 'Pinnacle Cycle'}</Text>
                  {pin && interps[`life_path_${pin.number.value}`]?.overview && (
                    <Text style={styles.mutedText}>{interps[`life_path_${pin.number.value}`].overview?.slice(0, 90)}…</Text>
                  )}
                </View>
                <View style={styles.forecastColLast}>
                  <Text style={styles.label}>Challenge</Text>
                  <Text style={styles.medNum}>{ch?.number != null ? String(ch.number) : '0'}</Text>
                  <Text style={styles.cardTitle}>{ch?.label ?? 'Challenge Cycle'}</Text>
                  {ch?.number != null && interps[`life_path_${ch.number}`]?.overview && (
                    <Text style={styles.mutedText}>{interps[`life_path_${ch.number}`].overview?.slice(0, 90)}…</Text>
                  )}
                </View>
              </View>
              <View style={styles.forecastThemes}>
                {info.bullets.map((b, i) => <Text key={i} style={styles.tag}>{b}</Text>)}
              </View>
            </View>
          ))}

          <SecHeading title="Summary & Future Directions" />
          <View style={styles.threeCardRow} wrap={false}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Your Greatest Strengths</Text>
              {(strengthBullets.length > 0 ? strengthBullets : ['Your natural gifts flow through your Life Path.', 'You have unique wisdom to offer the world.', 'Your soul carries deep potential.']).map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletIcon}>✓</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Areas for Growth</Text>
              {(growthBullets.length > 0 ? growthBullets : ['Embrace vulnerability and openness.', 'Balance personal needs with service.', 'Trust the journey when the path is unclear.']).map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletIconAmber}>○</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Your Path Forward</Text>
              {(pathBullets.length > 0 ? pathBullets : ['Follow the calling of your deepest values.', 'Align daily actions with your soul purpose.', 'Trust that you are exactly where you need to be.']).map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletIconViolet}>→</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.conclusionBox} wrap={false}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>✨</Text>
            <Text style={styles.conclusionHeading}>Summary Conclusion</Text>
            {closingParas.length > 0 ? (
              closingParas.map((p, i) => <Text key={i} style={{ ...styles.bodyText, textAlign: 'center' }}>{p}</Text>)
            ) : (
              <>
                <Text style={{ ...styles.bodyText, textAlign: 'center' }}>
                  With a Life Path {profile.lifePath.display} and Destiny {profile.destiny.methodA.display}, you carry a unique blueprint for this lifetime — gifts, lessons, and purpose that are entirely your own.
                </Text>
                <Text style={{ ...styles.bodyText, textAlign: 'center' }}>
                  As you move through Personal Year {pyCurr.display} in {currentYear}, step fully into your potential. Trust the wisdom of your numbers and know that every step is part of a perfectly orchestrated plan.
                </Text>
              </>
            )}
          </View>

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>Report Presented by</Text>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 4 }}>{practitioner.name}</Text>
            {practitioner.brandingFooter && <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{practitioner.brandingFooter}</Text>}
          </View>
        </View>
        <Footer name={practitioner.name} clientName={clientName} />
      </Page>

    </Document>
  )
}
