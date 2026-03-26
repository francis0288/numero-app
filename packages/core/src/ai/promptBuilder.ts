import type { NumerologyProfile, ForecastResult } from '../types/index.js'

export interface SelectedMethods {
  destinyMethod?: 'A' | 'B'
  soulMethod?: 'A' | 'B'
  personalityMethod?: 'A' | 'B'
}

export interface ReadingPromptInput {
  client: {
    firstName: string
    birthDate: string
    preferredLanguage: string
  }
  profile: NumerologyProfile
  forecast: {
    personalYear: ForecastResult
    personalMonth: ForecastResult
    personalDay: ForecastResult
  }
  tone: 'warm' | 'analytical' | 'spiritual' | 'practical'
  customFocus?: string
  selectedMethods?: SelectedMethods
  bookTexts?: {
    lifePath?: string
    personalYear?: string
  }
}

export interface FollowUpPromptInput {
  question: string
  firstName: string
  profile: NumerologyProfile
  existingReading: string
  preferredLanguage: string
}

function getLanguageInstruction(lang: string): string {
  if (lang === 'en') {
    return `Write the entire reading in English.
Use these section headings (keep the ## markdown):
## Overview
## Your Inner World
## Life Purpose & Gifts
## Challenges & Growth
## The Year Ahead
## Closing Guidance`
  }
  return `Viết toàn bộ bài đọc bằng tiếng Việt. Sử dụng tiếng Việt tự nhiên, ấm áp, chuyên nghiệp.
Sử dụng các tiêu đề phần sau (giữ nguyên dấu ## markdown):
## Tổng Quan
## Thế Giới Nội Tâm
## Mục Đích Sống & Tài Năng
## Thách Thức & Phát Triển
## Năm Phía Trước
## Lời Khuyên Kết`
}

function getToneInstruction(tone: 'warm' | 'analytical' | 'spiritual' | 'practical'): string {
  switch (tone) {
    case 'warm':       return 'Warm, encouraging, supportive, and hopeful.'
    case 'analytical': return 'Detailed, thorough, precise, and comprehensive.'
    case 'spiritual':  return 'Evocative, poetic, metaphorical, and soulful.'
    case 'practical':  return 'Direct, grounded, action-oriented, and clear.'
  }
}

function buildChartSummary(profile: NumerologyProfile, forecast: { personalYear: ForecastResult; personalMonth: ForecastResult; personalDay: ForecastResult }, methods?: SelectedMethods): string {
  const karmicLessons = profile.karmicLessons.length > 0
    ? profile.karmicLessons.join(', ')
    : 'None'

  const destiny = methods?.destinyMethod === 'B' ? profile.destiny.methodB : profile.destiny.methodA
  const soul = methods?.soulMethod === 'B' ? profile.soul.methodB : profile.soul.methodA
  const personality = methods?.personalityMethod === 'B' ? profile.personality.methodB : profile.personality.methodA

  return `NUMEROLOGY CHART:
Life Path:    ${profile.lifePath.display}
Destiny:      ${destiny.display}
Soul:         ${soul.display}
Personality:  ${personality.display}
Maturity:     ${profile.maturity.display}
Birth Day:    ${profile.birthDay.display}
Current Name: ${profile.currentName.display}
Attitude:     ${profile.attitude.display}
Karmic Lessons: ${karmicLessons}

TODAY'S FORECAST:
Personal Year: ${forecast.personalYear.display} | Personal Month: ${forecast.personalMonth.display} | Personal Day: ${forecast.personalDay.display}`
}

export function buildReadingPrompt(input: ReadingPromptInput): { system: string; user: string } {
  const langInstruction = getLanguageInstruction(input.client.preferredLanguage)
  const toneInstruction = getToneInstruction(input.tone)

  const system = `You are an expert numerologist trained in the Western Pythagorean system. You deliver profound, personalised readings.

${langInstruction}

Tone: ${toneInstruction}

Do not reference any books or other numerologists. Write as if these are your own professional insights.

Structure your response with exactly these 6 markdown headings and no others.`

  const chartSummary = buildChartSummary(input.profile, input.forecast, input.selectedMethods)

  const sectionHeadings = input.client.preferredLanguage === 'en'
    ? `## Overview\n## Your Inner World\n## Life Purpose & Gifts\n## Challenges & Growth\n## The Year Ahead\n## Closing Guidance`
    : `## Tổng Quan\n## Thế Giới Nội Tâm\n## Mục Đích Sống & Tài Năng\n## Thách Thức & Phát Triển\n## Năm Phía Trước\n## Lời Khuyên Kết`

  let user = `Please write a numerology reading for ${input.client.firstName}.

${chartSummary}`

  if (input.bookTexts?.lifePath || input.bookTexts?.personalYear) {
    user += `\n\nREFERENCE MATERIAL — use these interpretations as the basis for your reading. Paraphrase in your own voice; do not quote or translate directly.\n`
    if (input.bookTexts.lifePath) {
      user += `\n--- DIỄN GIẢI SÁCH: SỐ ĐƯỜNG ĐỜI ${input.profile.lifePath.display} ---\n${input.bookTexts.lifePath}`
    }
    if (input.bookTexts.personalYear) {
      user += `\n--- DIỄN GIẢI SÁCH: SỐ NĂM CÁ NHÂN ${input.forecast.personalYear.display} ---\n${input.bookTexts.personalYear}`
    }
    user += `\n\nHãy dựa trên các diễn giải từ sách để viết bài đọc bằng tiếng Việt. Diễn đạt lại bằng ngôn ngữ của bạn — không dịch thẳng.`
  }

  user += `\n\nWrite a reading with these 6 sections:
${sectionHeadings}
Each section: 2-3 paragraphs. End with one specific, actionable piece of guidance.`

  if (input.customFocus) {
    user += `\n\nPlease particularly address: ${input.customFocus}`
  }

  return { system, user }
}

export function buildFollowUpPrompt(input: FollowUpPromptInput): { system: string; user: string } {
  const langInstruction = getLanguageInstruction(input.preferredLanguage)

  const system = `You are an expert numerologist trained in the Western Pythagorean system. You deliver profound, personalised readings.

${langInstruction}`

  const karmicLessons = input.profile.karmicLessons.length > 0
    ? input.profile.karmicLessons.join(', ')
    : 'None'

  const chartSummary = `Life Path: ${input.profile.lifePath.display} | Destiny: ${input.profile.destiny.methodA.display} | Soul: ${input.profile.soul.methodA.display} | Personality: ${input.profile.personality.methodA.display} | Maturity: ${input.profile.maturity.display} | Birth Day: ${input.profile.birthDay.display} | Current Name: ${input.profile.currentName.display} | Attitude: ${input.profile.attitude.display} | Karmic Lessons: ${karmicLessons}`

  const readingSummary = input.existingReading.slice(0, 500)

  const user = `Client: ${input.firstName}
Chart: ${chartSummary}

Their reading summary:
${readingSummary}...

Question from the practitioner: ${input.question}

Answer in 2-3 paragraphs using only this person's chart.`

  return { system, user }
}
