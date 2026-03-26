import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropicClient } from '@/lib/anthropic'
import { getInterpretation } from '@/lib/numerology/getInterpretation'
import {
  calculateFullProfile,
  calculateFullForecast,
  buildReadingPrompt,
  stripVietnamese,
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

  const body = await req.json() as { tone?: string; customFocus?: string }
  const tone = (body.tone as 'warm' | 'analytical' | 'spiritual' | 'practical') || 'warm'
  const customFocus = body.customFocus

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

  // Fetch MB book interpretations for RAG injection
  const [lpInterp, pyInterp] = await Promise.all([
    getInterpretation(profile.lifePath.display, 'life_path'),
    getInterpretation(forecast.personalYear.display, 'personal_year'),
  ])

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
      lifePath: lpInterp?.textEn ?? undefined,
      personalYear: pyInterp?.textEn ?? undefined,
    },
  })

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
