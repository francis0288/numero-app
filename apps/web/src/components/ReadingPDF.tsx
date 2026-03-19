import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { NumerologyProfile, ForecastResult } from '@numero-app/core'

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: '#FDF6EC',
    fontSize: 11,
    color: '#2C2C2C',
  },
  coverSection: {
    backgroundColor: '#7B5EA7',
    borderRadius: 12,
    padding: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  coverName: {
    fontSize: 28,
    color: 'white',
    fontWeight: 500,
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  coverDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  preparedBy: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    color: '#7B5EA7',
    fontWeight: 500,
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1px solid #E8E0F0',
  },
  bodyText: {
    fontSize: 10.5,
    lineHeight: 1.7,
    marginBottom: 8,
    color: '#2C2C2C',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  numberCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    border: '1pt solid #E8E0F0',
    width: '30%',
  },
  bigNumber: {
    fontSize: 32,
    color: '#7B5EA7',
    fontWeight: 500,
  },
  numberLabel: {
    fontSize: 8,
    color: '#888888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  archetype: {
    fontSize: 9,
    color: '#2C2C2C',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    border: '1pt solid #E8E0F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroNumber: {
    fontSize: 56,
    color: '#D4AC6E',
    fontWeight: 500,
    marginRight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    borderTop: '1pt solid #E8E0F0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#888888',
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
})

export interface ReadingPDFProps {
  client: { firstName: string; lastName: string; dateOfBirth: string | Date }
  reading: { createdAt: string | Date; aiNarrative?: string | null; editedNarrative?: string | null }
  profile: NumerologyProfile
  forecast: { personalYear: ForecastResult; personalMonth: ForecastResult; personalDay: ForecastResult }
  interpretations: Record<string, { title?: string; overview?: string }>
  practitioner: { name: string; logoUrl?: string | null; brandingFooter?: string | null }
}

function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getNumberKey(result: { value: number; isMasterNumber?: boolean; isKarmicDebt?: boolean; karmicDebtNumber?: number }): string {
  if (result.isKarmicDebt && result.karmicDebtNumber) return `karmic_debt_${result.karmicDebtNumber}`
  if (result.isMasterNumber) return `master_${result.value}`
  return `life_path_${result.value}`
}

function parseSections(text: string) {
  return text.split(/\n(?=## )/).map((section) => {
    const lines = section.split('\n')
    const heading = lines[0].replace(/^## /, '').trim()
    const body = lines.slice(1).join('\n').trim()
    const paragraphs = body.split(/\n\n+/).filter(Boolean)
    return { heading, paragraphs }
  })
}

const CORE_LABELS: Record<string, string> = {
  destiny: 'Destiny',
  soul: 'Soul',
  personality: 'Personality',
  maturity: 'Maturity',
  birthDay: 'Birthday',
  currentName: 'Current Name',
}

export function ReadingPDF({
  client,
  reading,
  profile,
  forecast,
  interpretations,
  practitioner,
}: ReadingPDFProps) {
  const narrative = reading.editedNarrative ?? reading.aiNarrative ?? ''
  const sections = parseSections(narrative)

  const lifePathKey = getNumberKey(profile.lifePath)
  const lifePathInterp = interpretations[lifePathKey]

  const coreNumbers = [
    { key: 'destiny', label: CORE_LABELS.destiny, result: profile.destiny },
    { key: 'soul', label: CORE_LABELS.soul, result: profile.soul },
    { key: 'personality', label: CORE_LABELS.personality, result: profile.personality },
    { key: 'maturity', label: CORE_LABELS.maturity, result: profile.maturity },
    { key: 'birthDay', label: CORE_LABELS.birthDay, result: profile.birthDay },
    { key: 'currentName', label: CORE_LABELS.currentName, result: profile.currentName },
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Cover */}
        <View style={styles.coverSection}>
          {practitioner.logoUrl && (
            <Image src={practitioner.logoUrl} style={styles.logoImage} />
          )}
          <Text style={styles.preparedBy}>A reading by {practitioner.name}</Text>
          <Text style={styles.coverName}>{client.firstName} {client.lastName}</Text>
          <Text style={styles.coverSubtitle}>Numerology Reading</Text>
          <Text style={styles.coverDate}>{formatDate(reading.createdAt)}</Text>
        </View>

        {/* Your Numbers */}
        <Text style={styles.sectionHeading}>Your Numbers</Text>

        {/* Life Path hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroNumber}>{profile.lifePath.display}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.numberLabel}>Life Path Number</Text>
            {lifePathInterp?.title && (
              <Text style={{ fontSize: 12, fontWeight: 500, color: '#2C2C2C', marginBottom: 4 }}>
                {lifePathInterp.title}
              </Text>
            )}
            {lifePathInterp?.overview && (
              <Text style={styles.bodyText}>
                {lifePathInterp.overview.slice(0, 180)}...
              </Text>
            )}
          </View>
        </View>

        {/* 6 core numbers grid */}
        <View style={styles.numberGrid}>
          {coreNumbers.map(({ key, label, result }) => {
            const nKey = getNumberKey(result)
            const interp = interpretations[nKey]
            return (
              <View style={styles.numberCard} key={key}>
                <Text style={styles.numberLabel}>{label}</Text>
                <Text style={styles.bigNumber}>{result.display}</Text>
                {interp?.title && (
                  <Text style={styles.archetype}>{interp.title}</Text>
                )}
              </View>
            )
          })}
        </View>

        {/* Year Ahead */}
        <Text style={styles.sectionHeading}>Your Year Ahead</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Personal Year', value: forecast.personalYear.display },
            { label: 'Personal Month', value: forecast.personalMonth.display },
            { label: 'Personal Day', value: forecast.personalDay.display },
          ].map(({ label, value }) => (
            <View key={label} style={{ ...styles.numberCard, width: '30%', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, color: '#7B5EA7', fontWeight: 500 }}>{value}</Text>
              <Text style={styles.numberLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* The Reading */}
        <Text style={styles.sectionHeading}>Your Reading</Text>
        {sections.map((section, i) => (
          <View key={i} wrap={false}>
            {section.heading && (
              <Text style={{ ...styles.sectionHeading, fontSize: 12 }}>{section.heading}</Text>
            )}
            {section.paragraphs.map((p, j) => (
              <Text key={j} style={styles.bodyText}>{p}</Text>
            ))}
          </View>
        ))}

        {/* Footer on every page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            NumeroApp — {client.firstName} {client.lastName}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </View>

      </Page>
    </Document>
  )
}
