import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAnthropicClient } from '@/lib/anthropic'
import { buildFollowUpPrompt } from '@numero-app/core'
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
  })

  if (!client) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  const body = await req.json() as { question: string; readingId: string }
  const { question, readingId } = body

  const reading = await prisma.reading.findFirst({
    where: { id: readingId, clientId: params.id },
  })

  if (!reading) {
    return new Response(JSON.stringify({ error: 'Reading not found' }), { status: 404 })
  }

  const profile = JSON.parse(reading.profileJSON) as NumerologyProfile
  const existingReading = reading.editedNarrative ?? reading.aiNarrative ?? ''
  const language = client.preferredLanguage || 'en'

  const prompts = buildFollowUpPrompt({
    question,
    firstName: client.firstName,
    profile,
    existingReading,
    preferredLanguage: language,
  })

  // Create Session record
  const sessionRecord = await prisma.session.create({
    data: {
      readingId: reading.id,
      type: 'followup',
      question,
      answer: '',
    },
  })

  // Stream from Anthropic
  const stream = getAnthropicClient().messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: prompts.system,
    messages: [{ role: 'user', content: prompts.user }],
  })

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  ;(async () => {
    try {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          await writer.write(encoder.encode(event.delta.text))
        }
      }

      const finalMessage = await stream.finalMessage()
      const fullAnswer = finalMessage.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')

      // Update session record with full answer
      await prisma.session.update({
        where: { id: sessionRecord.id },
        data: { answer: fullAnswer },
      })

      await writer.write(
        encoder.encode(`\n[DONE:{"sessionId":"${sessionRecord.id}"}]`)
      )
    } catch (err) {
      console.error('Follow-up streaming error:', err)
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
