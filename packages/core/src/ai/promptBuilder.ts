import type { NumerologyProfile, ForecastResult } from '../types/index.js'

export interface SelectedMethods {
  destinyMethod?: 'A' | 'B'
  soulMethod?: 'A' | 'B'
  personalityMethod?: 'A' | 'B'
}

export type ReadingMode = 'book' | 'warm' | 'practical' | 'truth'

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
  readingMode: ReadingMode
  customFocus?: string
  selectedMethods?: SelectedMethods
  bookTexts?: {
    lifePath?: string
    personalYear?: string
    pinnacle?: string
    pinnacleKey?: string
    pinnacleNote?: string
  }
}

export interface FollowUpPromptInput {
  question: string
  firstName: string
  profile: NumerologyProfile
  existingReading: string
  preferredLanguage: string
}

function getModeSystemPrompt(mode: ReadingMode): string {
  switch (mode) {
    case 'book':
      return `Bạn là chuyên gia thần số học. Nhiệm vụ của bạn là viết bài đọc thần số học DỰA HOÀN TOÀN vào nội dung sách được cung cấp bên dưới.

QUY TẮC BẮT BUỘC:
- Chỉ sử dụng thông tin từ phần "DIỄN GIẢI SÁCH" được cung cấp.
- Không thêm thông tin từ nguồn khác ngoài sách.
- Giữ giọng văn và quan điểm của tác giả (Michelle Buchanan / David Phillips).
- Nếu một số không có nội dung sách, chỉ nêu số đó và ý nghĩa cơ bản.
- Viết bằng tiếng Việt, diễn đạt tự nhiên — không dịch thẳng từng câu.

CẤU TRÚC BÀI ĐỌC:
## Tổng Quan
## Thế Giới Nội Tâm
## Mục Đích Sống & Tài Năng
## Thách Thức & Phát Triển
## Năm Phía Trước
## Lời Khuyên Kết`

    case 'warm':
      return `Bạn là chuyên gia thần số học với tâm hồn nhân ái và ấm áp.
Viết bài đọc bằng tiếng Việt với giọng văn ấm áp, khuyến khích và đồng cảm.

PHONG CÁCH:
- Trình bày thách thức một cách nhẹ nhàng nhưng trung thực — không che giấu sự thật.
- Nhấn mạnh tiềm năng và điểm mạnh.
- Sử dụng ngôn ngữ gần gũi, như một người bạn tin cậy đang chia sẻ.
- Tránh ngôn ngữ phán xét hoặc tiêu cực quá mức.

CẤU TRÚC BÀI ĐỌC:
## Tổng Quan
## Thế Giới Nội Tâm
## Mục Đích Sống & Tài Năng
## Thách Thức & Phát Triển
## Năm Phía Trước
## Lời Khuyên Kết`

    case 'practical':
      return `Bạn là chuyên gia thần số học thực dụng.
Viết bài đọc bằng tiếng Việt tập trung vào ứng dụng thực tế trong cuộc sống.

PHONG CÁCH:
- Với mỗi số, giải thích RÕ RÀNG cách áp dụng trong công việc, mối quan hệ, và cuộc sống hàng ngày.
- Đưa ra hành động cụ thể, có thể thực hiện ngay.
- Tránh ngôn ngữ trừu tượng hoặc tâm linh quá mức.
- Thực tế, súc tích, dễ hiểu.

CẤU TRÚC BÀI ĐỌC:
## Điểm Mạnh Cần Phát Huy
## Thách Thức Cần Vượt Qua
## Hành Động Trong Năm Nay
## Lời Khuyên Thực Tế`

    case 'truth':
      return `Bạn là chuyên gia thần số học thẳng thắn và trung thực.
Viết bài đọc bằng tiếng Việt hoàn toàn khách quan — không tô hồng, không che giấu.

PHONG CÁCH:
- Trình bày ĐẦY ĐỦ mặt tích cực, tiêu cực VÀ trung tính của mỗi số.
- Không làm nhẹ đi những thách thức khó khăn.
- Không phóng đại điểm mạnh.
- Ngôn ngữ thẳng thắn, rõ ràng, khách quan.
- Đây là bài đọc NỘI BỘ — không dùng để chia sẻ với thân chủ trực tiếp.

CẤU TRÚC BÀI ĐỌC:
## Đánh Giá Tổng Quan
## Điểm Mạnh Thực Sự
## Điểm Yếu Cần Nhìn Nhận
## Năng Lượng Hiện Tại
## Dự Báo Thẳng Thắn`
  }
}

function getModeHeadings(mode: ReadingMode): string {
  switch (mode) {
    case 'book':
    case 'warm':
      return `## Tổng Quan\n## Thế Giới Nội Tâm\n## Mục Đích Sống & Tài Năng\n## Thách Thức & Phát Triển\n## Năm Phía Trước\n## Lời Khuyên Kết`
    case 'practical':
      return `## Điểm Mạnh Cần Phát Huy\n## Thách Thức Cần Vượt Qua\n## Hành Động Trong Năm Nay\n## Lời Khuyên Thực Tế`
    case 'truth':
      return `## Đánh Giá Tổng Quan\n## Điểm Mạnh Thực Sự\n## Điểm Yếu Cần Nhìn Nhận\n## Năng Lượng Hiện Tại\n## Dự Báo Thẳng Thắn`
  }
}

function buildChartSummary(
  profile: NumerologyProfile,
  forecast: { personalYear: ForecastResult; personalMonth: ForecastResult; personalDay: ForecastResult },
  methods?: SelectedMethods,
): string {
  const karmicLessons = profile.karmicLessons.length > 0
    ? profile.karmicLessons.join(', ')
    : 'None'

  const destiny     = methods?.destinyMethod === 'B'     ? profile.destiny.methodB     : profile.destiny.methodA
  const soul        = methods?.soulMethod === 'B'        ? profile.soul.methodB        : profile.soul.methodA
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
  const system   = getModeSystemPrompt(input.readingMode)
  const headings = getModeHeadings(input.readingMode)

  const chartSummary = buildChartSummary(input.profile, input.forecast, input.selectedMethods)

  let user = `Viết bài đọc thần số học cho ${input.client.firstName}.\n\n${chartSummary}`

  if (input.bookTexts?.lifePath || input.bookTexts?.personalYear || input.bookTexts?.pinnacle) {
    user += `\n\nNỘI DUNG SÁCH THAM KHẢO — sử dụng các diễn giải này làm cơ sở cho bài đọc. Diễn đạt lại bằng giọng văn của bạn — không dịch thẳng.\n`
    if (input.bookTexts.lifePath) {
      user += `\n--- DIỄN GIẢI SÁCH: SỐ ĐƯỜNG ĐỜI ${input.profile.lifePath.display} ---\n${input.bookTexts.lifePath}`
    }
    if (input.bookTexts.personalYear) {
      user += `\n--- DIỄN GIẢI SÁCH: SỐ NĂM CÁ NHÂN ${input.forecast.personalYear.display} ---\n${input.bookTexts.personalYear}`
    }
    if (input.bookTexts.pinnacle && input.bookTexts.pinnacleKey) {
      user += `\n--- DIỄN GIẢI SÁCH: SỐ ĐỈNH HIỆN TẠI ---\n${input.bookTexts.pinnacle}`
    } else if (input.bookTexts.pinnacleNote) {
      user += `\n--- SỐ ĐỈNH KIM TỰ THÁP HIỆN TẠI ---\n${input.bookTexts.pinnacleNote}`
    }
    if (input.readingMode === 'book') {
      user += `\n\nChỉ dựa vào nội dung sách được cung cấp. Với số nào không có nội dung sách, chỉ nêu số đó và ý nghĩa cơ bản.`
    } else {
      user += `\n\nHãy dựa trên các diễn giải từ sách để viết bài đọc bằng tiếng Việt.`
    }
  }

  user += `\n\nViết bài đọc với các phần sau:\n${headings}\nMỗi phần: 2–3 đoạn văn.`

  if (input.customFocus) {
    user += `\n\nĐặc biệt tập trung vào: ${input.customFocus}`
  }

  return { system, user }
}

export function buildFollowUpPrompt(input: FollowUpPromptInput): { system: string; user: string } {
  const system = `Bạn là chuyên gia thần số học với kiến thức sâu về hệ thống Pythagoras.
Viết bằng tiếng Việt, tự nhiên và chuyên nghiệp.`

  const karmicLessons = input.profile.karmicLessons.length > 0
    ? input.profile.karmicLessons.join(', ')
    : 'None'

  const chartSummary = `Life Path: ${input.profile.lifePath.display} | Destiny: ${input.profile.destiny.methodA.display} | Soul: ${input.profile.soul.methodA.display} | Personality: ${input.profile.personality.methodA.display} | Maturity: ${input.profile.maturity.display} | Birth Day: ${input.profile.birthDay.display} | Current Name: ${input.profile.currentName.display} | Attitude: ${input.profile.attitude.display} | Karmic Lessons: ${karmicLessons}`

  const readingSummary = input.existingReading.slice(0, 500)

  const user = `Thân chủ: ${input.firstName}
Biểu đồ: ${chartSummary}

Tóm tắt bài đọc:
${readingSummary}...

Câu hỏi từ chuyên viên: ${input.question}

Trả lời trong 2–3 đoạn văn, chỉ sử dụng thông tin từ biểu đồ này.`

  return { system, user }
}
