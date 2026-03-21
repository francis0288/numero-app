'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface ReadingItem {
  id: string
  version: number
  status: string
}

export default function FollowUpPage(): React.ReactElement {
  const params = useParams()
  const id = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [clientName, setClientName] = useState('')
  const [readingId, setReadingId] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadLatestReading = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}/readings`)
      if (!res.ok) return
      const data = await res.json() as { readings: ReadingItem[] }
      if (data.readings && data.readings.length > 0) {
        setReadingId(data.readings[0].id)
      }

      // Also get client name
      const readingRes = await fetch(`/api/clients/${id}/reading/${data.readings[0]?.id}`)
      if (readingRes.ok) {
        const readingData = await readingRes.json() as { firstName: string }
        setClientName(readingData.firstName)
      }
    } catch {
      // ignore
    }
  }, [id])

  useEffect(() => {
    void loadLatestReading()
  }, [loadLatestReading])

  const handleSubmit = async () => {
    const question = inputText.trim()
    if (!question || isStreaming) return

    const userMsgId = Date.now().toString()
    const assistantMsgId = (Date.now() + 1).toString()

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question, id: userMsgId },
      { role: 'assistant', content: '', id: assistantMsgId },
    ])
    setInputText('')
    setIsStreaming(true)

    try {
      const response = await fetch(`/api/clients/${id}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, readingId }),
      })

      if (!response.ok || !response.body) {
        setIsStreaming(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        if (chunk.includes('[DONE:')) {
          const textPart = chunk.split('\n[DONE:')[0]
          if (textPart) {
            fullAnswer += textPart
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: fullAnswer } : m
              )
            )
          }
        } else {
          fullAnswer += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: fullAnswer } : m
            )
          )
        }
      }
    } catch (err) {
      console.error('Follow-up error:', err)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const suggestionChips = [
    'Năm nay có tốt để thay đổi công việc không?',
    'Số Linh Hồn có ý nghĩa gì với các mối quan hệ?',
    'Điểm mạnh lớn nhất trong năm nay là gì?',
  ]

  const lastMessage = messages[messages.length - 1]
  const showLoadingDots =
    isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === ''

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <main className="max-w-[700px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/clients/${id}/reading`}
            className="text-sm text-[#888888] hover:text-[#7B5EA7] transition-colors block mb-3"
          >
            ← Quay lại bài đọc
          </Link>
          <h1 className="text-2xl font-medium text-[#2C2C2C]">
            {clientName ? `${clientName} — Hỏi & Đáp` : 'Hỏi & Đáp'}
          </h1>
        </div>

        {/* Chat area */}
        <div className="min-h-[400px] space-y-4 mb-6">
          {messages.length === 0 ? (
            <div>
              <p className="text-sm text-[#888888] mb-3">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setInputText(chip)}
                    className="bg-white border border-[#E8E0F0] rounded-full px-3 py-1.5 text-sm text-[#7B5EA7] hover:bg-[#F5F0FB] cursor-pointer transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="bg-[#F5F0FB] rounded-2xl rounded-tr-sm p-4 ml-16 text-[#2C2C2C] text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E0F0] rounded-2xl rounded-tl-sm p-4 mr-16 text-[#2C2C2C] leading-relaxed text-sm">
                  {msg.content === '' && showLoadingDots ? (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#7B5EA7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#7B5EA7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#7B5EA7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 bg-[#FDF6EC] pt-4 border-t border-[#E8E0F0]">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={clientName ? `Hỏi về biểu đồ số học của ${clientName}...` : 'Hỏi về biểu đồ số học...'}
              className="w-full p-3 border border-[#E8E0F0] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]"
            />
            <button
              onClick={() => void handleSubmit()}
              disabled={isStreaming || !inputText.trim()}
              className="bg-[#7B5EA7] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#6B4E97] transition-colors shrink-0"
            >
              Gửi
            </button>
          </div>
          <p className="text-xs text-[#888888] mt-1">⌘ + Enter để gửi</p>
        </div>
      </main>
    </div>
  )
}
