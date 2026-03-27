import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropicClient } from '@/lib/anthropic'
import { getInterpretation, toInterpretationKey } from '@/lib/numerology/getInterpretation'
import {
  calculateFullProfile,
  calculateFullForecast,
  buildReadingPrompt,
  stripVietnamese,
  PYTHAGOREAN_MAP,
  calculatePyramidPeaks,
  getActivePeak,
  calculateWorldYearNumber,
} from '@numero-app/core'
import type { NumerologyProfile } from '@numero-app/core'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { readings: { orderBy: { version: 'desc' }, take: 1 } },
  })

  if (!client) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const body = await req.json() as { tone?: string; customFocus?: string; selectedNumbers?: string[] }
  const tone = (body.tone as 'warm' | 'analytical' | 'spiritual' | 'practical') || 'warm'
  const customFocus = body.customFocus
  const DEFAULT_KEYS = ['life_path','destiny','soul','personality','personal_year','pinnacle','essence','missing_numbers']
  const sel = new Set<string>(body.selectedNumbers ?? DEFAULT_KEYS)

  const birthDateStr = client.dateOfBirth.toISOString().split('T')[0]

  // Resolve profile
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

  const profileJSON = JSON.stringify(profile)

  // Calculate forecast
  const forecast = calculateFullForecast({
    birthDate: birthDateStr,
    birthCertName: client.birthCertName,
    lifePath: profile.lifePath,
    nameParts: {
      lastName:   stripVietnamese(client.lastName),
      middleName: client.middleName ? stripVietnamese(client.middleName) : undefined,
      firstName:  stripVietnamese(client.firstName),
    },
  })

  const language = client.preferredLanguage || 'en'

  // Determine active pinnacle based on selected system
  const pinnacleSystem = ((client.pinnacleSystem ?? 'buchanan') as string) as 'buchanan' | 'phillips'
  let pinnacleKey: string | null = null
  let pinnacleNote: string | null = null

  if (pinnacleSystem === 'phillips') {
    const birthDate = client.dateOfBirth
    const today2 = new Date()
    let currentAge = today2.getFullYear() - birthDate.getFullYear()
    const mm = today2.getMonth() - birthDate.getMonth()
    if (mm < 0 || (mm === 0 && today2.getDate() < birthDate.getDate())) currentAge--
    const pyramidResult = calculatePyramidPeaks(
      birthDate.getDate(),
      birthDate.getMonth() + 1,
      birthDate.getFullYear(),
      profile.lifePath.value,
      today2.getFullYear()
    )
    const activePeak = getActivePeak(pyramidResult.peaks, currentAge)
    if (activePeak) {
      pinnacleKey = activePeak.number <= 9 ? toInterpretationKey(activePeak.number) : null
      pinnacleNote = `Số Đỉnh Kim Tự Tháp (David Phillips) hiện tại: ${activePeak.label} — ${activePeak.description}`
    }
  } else {
    const activePinnacle = forecast.pinnacles.find(p => p.isCurrent)
    pinnacleKey = activePinnacle?.number.display ?? null
  }

  // Fetch MB book interpretations for RAG injection (only for selected numbers)
  const [lpInterp, pyInterp, pinnacleInterp] = await Promise.all([
    sel.has('life_path') ? getInterpretation(profile.lifePath.display, 'life_path') : Promise.resolve(null),
    sel.has('personal_year') ? getInterpretation(forecast.personalYear.display, 'personal_year') : Promise.resolve(null),
    (sel.has('pinnacle') && pinnacleKey) ? getInterpretation(pinnacleKey, 'pinnacle') : Promise.resolve(null),
  ])

  console.log('Reading route: system=', pinnacleSystem, '| pinnacleKey=', pinnacleKey, '| keywords=', pinnacleInterp?.keywordsEn)

  // Resolve selected method values
  const destinyResolved = (client.destinyMethod as string) === 'B' ? profile.destiny.methodB : profile.destiny.methodA
  const soulResolved = (client.soulMethod as string) === 'B' ? profile.soul.methodB : profile.soul.methodA
  const personalityResolved = (client.personalityMethod as string) === 'B' ? profile.personality.methodB : profile.personality.methodA

  // Missing numbers (same algorithm as BirthChartGrid)
  const missingNumbers = (() => {
    const counts: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0}
    const dob = client.dateOfBirth
    const birthRaw = String(dob.getDate()).padStart(2,'0') + String(dob.getMonth()+1).padStart(2,'0') + String(dob.getFullYear())
    for (const ch of birthRaw) { const d = parseInt(ch,10); if (d >= 1 && d <= 9) counts[d]++ }
    const stripped = [
      stripVietnamese(client.lastName),
      client.middleName ? stripVietnamese(client.middleName) : '',
      stripVietnamese(client.firstName),
    ].filter(Boolean).join(' ')
    for (const ch of stripped) {
      if (ch === ' ') continue
      const v = PYTHAGOREAN_MAP[ch.toUpperCase()]
      if (v && v >= 1 && v <= 9) counts[v]++
    }
    return [1,2,3,4,5,6,7,8,9].filter(n => counts[n] === 0)
  })()

  const currentYear = new Date().getFullYear()
  const worldYearValue = calculateWorldYearNumber(currentYear)

  // Build prompt
  const prompts = buildReadingPrompt({
    client: {
      firstName: client.firstName,
      birthDate: birthDateStr,
      preferredLanguage: language,
    },
    profile,
    forecast,
    tone,
    customFocus,
    selectedMethods: {
      destinyMethod: (client.destinyMethod as 'A' | 'B') ?? 'A',
      soulMethod: (client.soulMethod as 'A' | 'B') ?? 'A',
      personalityMethod: (client.personalityMethod as 'A' | 'B') ?? 'A',
    },
    bookTexts: {
      lifePath: sel.has('life_path') ? (lpInterp?.textEn ?? undefined) : undefined,
      personalYear: sel.has('personal_year') ? (pyInterp?.textEn ?? undefined) : undefined,
      pinnacle: sel.has('pinnacle') ? (pinnacleInterp?.textEn ?? undefined) : undefined,
      pinnacleKey: sel.has('pinnacle') ? (pinnacleKey ?? undefined) : undefined,
      pinnacleNote: (sel.has('pinnacle') && !pinnacleInterp && pinnacleNote) ? pinnacleNote : undefined,
    },
  })

  // Append selected-number sections for numbers not covered by bookTexts
  const extraParts: string[] = []
  if (sel.has('destiny'))
    extraParts.push(`--- SỐ SỨ MỆNH: ${destinyResolved.display} ---\nSố Sứ Mệnh của thân chủ là ${destinyResolved.display}.`)
  if (sel.has('soul'))
    extraParts.push(`--- SỐ LINH HỒN: ${soulResolved.display} ---\nSố Linh Hồn của thân chủ là ${soulResolved.display}.`)
  if (sel.has('personality'))
    extraParts.push(`--- SỐ NHÂN CÁCH: ${personalityResolved.display} ---\nSố Nhân Cách của thân chủ là ${personalityResolved.display}.`)
  if (sel.has('maturity'))
    extraParts.push(`--- SỐ TRƯỞNG THÀNH: ${profile.maturity.display} ---\nSố Trưởng Thành của thân chủ là ${profile.maturity.display}.`)
  if (sel.has('birth_day'))
    extraParts.push(`--- SỐ NGÀY SINH: ${profile.birthDay.display} ---\nSố Ngày Sinh của thân chủ là ${profile.birthDay.display}.`)
  if (sel.has('essence'))
    extraParts.push(`--- SỐ TINH CHẤT HIỆN TẠI: ${forecast.essenceNumber.display} ---\nSố Tinh Chất hiện tại của thân chủ là ${forecast.essenceNumber.display}.`)
  if (sel.has('missing_numbers') && missingNumbers.length > 0)
    extraParts.push(`--- SỐ THIẾU ---\nSố thiếu trong biểu đồ: ${missingNumbers.join(', ')}. Đây là những năng lượng cần phát triển.`)
  if (sel.has('attitude'))
    extraParts.push(`--- SỐ THÁI ĐỘ: ${profile.attitude.display} ---\nSố Thái Độ của thân chủ là ${profile.attitude.display}.`)
  if (sel.has('bridge'))
    extraParts.push(`--- SỐ KẾT NỐI: ${profile.bridge.display} ---\nSố Kết Nối (Bridge) của thân chủ là ${profile.bridge.display}.`)
  if (sel.has('world_year'))
    extraParts.push(`--- NĂM THẾ GIỚI ${currentYear}: ${worldYearValue} ---\nNăm Thế Giới ${currentYear} là ${worldYearValue}.`)

  if (extraParts.length > 0) {
    prompts.user += '\n\nSỐ LIỆU BỔ SUNG:\n' + extraParts.join('\n\n')
  }
  prompts.user += '\n\nHãy đề cập đến các số được cung cấp trong bài đọc. Viết bằng tiếng Việt, diễn đạt tự nhiên — không liệt kê số liệu một cách máy móc.'

  // Count existing readings to determine version
  const readingCount = await prisma.reading.count({
    where: { clientId: client.id },
  })

  // Create new Reading row
  const reading = await prisma.reading.create({
    data: {
      clientId: client.id,
      version: readingCount + 1,
      status: 'draft',
      tone,
      language,
      profileJSON,
      aiNarrative: '',
    },
  })

  console.log('Reading route: ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY, '| prefix:', process.env.ANTHROPIC_API_KEY?.slice(0, 10))

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  // Process stream in background
  ;(async () => {
    try {
      console.log('Reading route: starting Anthropic stream')
      const stream = getAnthropicClient().messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: prompts.system,
        messages: [{ role: 'user', content: prompts.user }],
      })

      let chunkCount = 0
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          chunkCount++
          await writer.write(encoder.encode(event.delta.text))
        }
      }
      console.log('Reading route: stream complete, chunks written:', chunkCount)

      const finalMessage = await stream.finalMessage()
      const fullText = finalMessage.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')

      await prisma.reading.update({
        where: { id: reading.id },
        data: { aiNarrative: fullText },
      })

      await writer.write(
        encoder.encode(`\n[DONE:{"readingId":"${reading.id}","version":${reading.version}}]`)
      )
    } catch (err) {
      console.error('Reading route: Anthropic stream error:', err)
      // Write error into stream so the browser console can surface it
      try {
        await writer.write(encoder.encode(`\n[ERROR:${String(err)}]`))
      } catch { /* writer may already be closed */ }
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Accel-Buffering': 'no',
    },
  })
}
