import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropicClient } from '@/lib/anthropic'

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Simplified Chinese (简体中文)',
  vi: 'Vietnamese (Tiếng Việt)',
}

const LANG_INSTRUCTIONS: Record<string, string> = {
  vi: 'Translate entirely into Vietnamese (Tiếng Việt). Use natural, warm Vietnamese. Preserve all ## section headings.',
  zh: 'Translate entirely into Simplified Chinese (简体中文). Use natural, warm Chinese. Preserve all ## section headings.',
  en: 'Translate entirely into English. Preserve all ## section headings.',
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; readingId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!client) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const reading = await prisma.reading.findFirst({
    where: { id: params.readingId, clientId: params.id },
  })
  if (!reading) {
    return new Response(JSON.stringify({ error: 'Reading not found' }), { status: 404 })
  }

  const body = await req.json() as { targetLanguage?: string }
  const targetLanguage = body.targetLanguage ?? 'en'
  const langName = LANG_NAMES[targetLanguage] ?? 'English'
  const langInstruction = LANG_INSTRUCTIONS[targetLanguage] ?? LANG_INSTRUCTIONS.en

  const sourceText = reading.editedNarrative ?? reading.aiNarrative ?? ''
  if (!sourceText) {
    return new Response(JSON.stringify({ error: 'No reading text to translate' }), { status: 400 })
  }

  // Count existing readings to determine next version
  const readingCount = await prisma.reading.count({ where: { clientId: params.id } })

  // Create the new reading row upfront (empty narrative, filled after stream)
  const newReading = await prisma.reading.create({
    data: {
      clientId: params.id,
      version: readingCount + 1,
      language: targetLanguage,
      tone: reading.tone,
      status: 'draft',
      profileJSON: reading.profileJSON,
      aiNarrative: '',
    },
  })

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  ;(async () => {
    try {
      const stream = getAnthropicClient().messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        system: `You are a professional translator specialising in spiritual and numerology content. Translate accurately while preserving the warm, personal tone.\n\n${langInstruction}`,
        messages: [
          {
            role: 'user',
            content: `Translate this numerology reading into ${langName}.\nPreserve the ## markdown headings exactly.\nPreserve all personal names as-is.\n\nReading to translate:\n${sourceText}`,
          },
        ],
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          await writer.write(encoder.encode(event.delta.text))
        }
      }

      const finalMessage = await stream.finalMessage()
      const fullText = finalMessage.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')

      await prisma.reading.update({
        where: { id: newReading.id },
        data: { aiNarrative: fullText },
      })

      await writer.write(
        encoder.encode(`\n[DONE:{"readingId":"${newReading.id}","version":${newReading.version}}]`)
      )
    } catch (err) {
      console.error('Translation stream error:', err)
      try {
        await writer.write(encoder.encode(`\n[ERROR:${String(err)}]`))
      } catch { /* ignore */ }
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  })
}
