'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Tone = 'warm' | 'analytical' | 'spiritual' | 'practical'
type Status = 'draft' | 'finalised' | null

interface ReadingItem {
  id: string
  version: number
  createdAt: string
  language: string
  tone: string
  status: string
  preview: string
}

function MarkdownReading({ text }: { text: string }): React.ReactElement {
  const sections = text.split(/\n(?=## )/)
  return (
    <div>
      {sections.map((section, i) => {
        const lines = section.split('\n')
        const heading = lines[0].replace(/^## /, '').trim()
        const body = lines.slice(1).join('\n').trim()
        const paragraphs = body.split(/\n\n+/).filter(Boolean)
        return (
          <div key={i}>
            {heading && (
              <h2 className="text-[#7B5EA7] font-medium text-lg mt-8 mb-3 pb-2 border-b border-[#E8E0F0]">
                {heading}
              </h2>
            )}
            {paragraphs.map((para, j) => (
              <p key={j} className="text-[#2C2C2C] leading-relaxed mb-4">
                {para}
              </p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function ReadingPage(): React.ReactElement {
  const params = useParams()
  const id = params.id as string

  const [tone, setTone] = useState<Tone>('warm')
  const [customFocus, setCustomFocus] = useState('')
  const [showCustomFocus, setShowCustomFocus] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [readingId, setReadingId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>(null)
  const [version, setVersion] = useState<number | null>(null)
  const [clientName, setClientName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [displayLanguage, setDisplayLanguage] = useState('vi')
  const [isTranslating, setIsTranslating] = useState(false)

  const loadLatestReading = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}/readings`)
      if (!res.ok) return
      const data = await res.json() as { readings: ReadingItem[] }
      if (data.readings && data.readings.length > 0) {
        const latest = data.readings[0]
        setReadingId(latest.id)
        setVersion(latest.version)
        setStatus(latest.status as Status)
        setDisplayLanguage(latest.language || 'vi')

        // Load full reading
        const readingRes = await fetch(`/api/clients/${id}/reading/${latest.id}`)
        if (readingRes.ok) {
          const readingData = await readingRes.json() as {
            reading: { aiNarrative: string | null; editedNarrative: string | null }
            firstName: string
            shareToken?: string
          }
          setClientName(readingData.firstName)
          const narrative = readingData.reading.editedNarrative ?? readingData.reading.aiNarrative ?? ''
          setStreamedText(narrative)
          if (latest.status === 'finalised' && readingData.shareToken) {
            setShareToken(readingData.shareToken)
          }
        }
      } else {
        // No readings yet — try to get client name
        try {
          const clientRes = await fetch(`/api/clients/${id}`)
          if (clientRes.ok) {
            const clientData = await clientRes.json() as { firstName?: string; client?: { firstName: string } }
            setClientName(clientData.firstName ?? clientData.client?.firstName ?? '')
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, [id])

  useEffect(() => {
    void loadLatestReading()
  }, [loadLatestReading])

  const handleGenerate = async () => {
    console.log('handleGenerate called, clientId:', id)
    setIsStreaming(true)
    setStreamedText('')
    setReadingId(null)
    setStatus(null)

    try {
      const response = await fetch(`/api/clients/${id}/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, customFocus: showCustomFocus ? customFocus : undefined }),
      })

      if (!response.ok || !response.body) {
        console.error('Reading API error:', response.status, await response.text().catch(() => ''))
        setIsStreaming(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        console.log('Stream chunk received:', chunk.length, 'chars')

        if (chunk.includes('[ERROR:')) {
          console.error('Server stream error:', chunk)
          break
        }

        if (chunk.includes('[DONE:')) {
          const match = chunk.match(/\[DONE:(\{.*?\})\]/)
          if (match) {
            const data = JSON.parse(match[1]) as { readingId: string; version: number }
            setReadingId(data.readingId)
            setVersion(data.version)
            setStatus('draft')
          }
          const textPart = chunk.split('\n[DONE:')[0]
          if (textPart) {
            fullText += textPart
            setStreamedText(fullText)
          }
        } else {
          fullText += chunk
          setStreamedText(fullText)
        }
      }
    } catch (err) {
      console.error('Generation error:', err)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSaveEdits = async () => {
    if (!readingId) return
    setIsSaving(true)
    try {
      await fetch(`/api/clients/${id}/reading/${readingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedNarrative: editText }),
      })
      setStreamedText(editText)
      setIsEditing(false)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalise = async () => {
    if (!readingId) return
    try {
      const res = await fetch(`/api/clients/${id}/reading/${readingId}/finalise`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json() as { shareToken: string }
        setStatus('finalised')
        setShareToken(data.shareToken)
      }
    } catch (err) {
      console.error('Finalise error:', err)
    }
  }

  const handleCopyLink = async () => {
    if (!shareToken) return
    const link = `${window.location.origin}/report/${shareToken}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTranslate = async (targetLang: string) => {
    if (!readingId || isTranslating || targetLang === displayLanguage) return
    setIsTranslating(true)
    setStreamedText('')

    try {
      const response = await fetch(
        `/api/clients/${id}/reading/${readingId}/translate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetLanguage: targetLang }),
        }
      )
      if (!response.ok || !response.body) {
        console.error('Translate error:', response.status)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        if (chunk.includes('[ERROR:')) {
          console.error('Translation error from server:', chunk)
          break
        }

        if (chunk.includes('[DONE:')) {
          const match = chunk.match(/\[DONE:(\{.*?\})\]/)
          if (match) {
            const data = JSON.parse(match[1]) as { readingId: string; version: number }
            setReadingId(data.readingId)
            setVersion(data.version)
            setStatus('draft')
            setShareToken(null)
          }
          const textPart = chunk.split('\n[DONE:')[0]
          if (textPart) {
            fullText += textPart
            setStreamedText(fullText)
          }
        } else {
          fullText += chunk
          setStreamedText(fullText)
        }
      }

      setDisplayLanguage(targetLang)
    } catch (err) {
      console.error('Translation failed:', err)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleRegenerate = () => {
    if (window.confirm('Generate a new reading? The current version will be replaced.')) {
      setStreamedText('')
      setReadingId(null)
      setStatus(null)
      setVersion(null)
    }
  }

  const tones: Array<{ value: Tone; label: string }> = [
    { value: 'warm', label: '✨ Warm' },
    { value: 'analytical', label: '📊 Analytical' },
    { value: 'spiritual', label: '🌙 Spiritual' },
    { value: 'practical', label: '⚡ Practical' },
  ]

  const showGenerationPanel = !streamedText && !isStreaming
  const showReadingDisplay = streamedText || isStreaming

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <main className="max-w-[800px] mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/clients/${id}/profile`}
              className="text-sm text-[#888888] hover:text-[#7B5EA7] transition-colors"
            >
              ← Back to profile
            </Link>
            {clientName && (
              <h1 className="text-xl font-medium text-[#2C2C2C]">{clientName}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {version !== null && (
              <span className="bg-[#F5F0FB] text-[#7B5EA7] text-xs px-2 py-1 rounded-full">
                Reading v{version}
              </span>
            )}
            {status === 'draft' && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-1 rounded-full">
                Draft
              </span>
            )}
            {status === 'finalised' && (
              <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-full">
                Finalised
              </span>
            )}
          </div>
        </div>

        {/* Section A — Generation panel */}
        {showGenerationPanel && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-6">
            <h2 className="text-[#7B5EA7] font-medium text-lg mb-5">Generate AI Reading</h2>

            {/* Tone selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tones.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTone(value)}
                  className={
                    tone === value
                      ? 'bg-[#7B5EA7] text-white rounded-full px-4 py-2 text-sm font-medium'
                      : 'bg-white border border-[#E8E0F0] text-[#888888] rounded-full px-4 py-2 text-sm hover:border-[#7B5EA7] cursor-pointer'
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom focus */}
            {!showCustomFocus ? (
              <button
                onClick={() => setShowCustomFocus(true)}
                className="text-[#7B5EA7] text-sm"
              >
                + Add custom focus (optional)
              </button>
            ) : (
              <textarea
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="e.g. She is considering changing careers this year..."
                rows={3}
                className="w-full mt-3 p-3 border border-[#E8E0F0] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]"
              />
            )}

            <button
              type="button"
              onClick={() => void handleGenerate()}
              className="w-full mt-6 bg-[#7B5EA7] text-white rounded-xl py-3 font-medium hover:bg-[#6B4E97] transition-colors"
            >
              Generate Reading
            </button>
          </div>
        )}

        {/* Language bar — shown when a reading exists */}
        {showReadingDisplay && (
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#888888] text-sm">Reading language:</span>
              <span className="bg-[#F5F0FB] text-[#7B5EA7] rounded-full px-3 py-1 text-sm">
                {displayLanguage === 'vi' ? 'Tiếng Việt' : displayLanguage === 'zh' ? '简体中文' : 'English'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isTranslating ? (
                <span className="text-[#7B5EA7] text-xs animate-pulse">Translating…</span>
              ) : (
                <span className="text-[#888888] text-xs">Translate to:</span>
              )}
              {(['en', 'zh', 'vi'] as const).map((lang) => {
                const labels = { en: 'EN', zh: '中文', vi: 'Việt' }
                const isActive = displayLanguage === lang
                return (
                  <button
                    key={lang}
                    type="button"
                    disabled={isActive || isTranslating}
                    onClick={() => void handleTranslate(lang)}
                    className={
                      isActive
                        ? 'bg-[#7B5EA7] text-white rounded-full px-3 py-1 text-xs font-medium cursor-default'
                        : 'bg-white border border-[#E8E0F0] text-[#888888] rounded-full px-3 py-1 text-xs hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors disabled:opacity-40'
                    }
                  >
                    {labels[lang]}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Section B — Reading display */}
        {showReadingDisplay && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0F0] p-6 md:p-8">
            {/* Progress bar while streaming or translating */}
            {(isStreaming || isTranslating) && (
              <div className="w-full h-1 bg-[#E8E0F0] rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#7B5EA7] rounded-full"
                  style={{
                    animation: 'progressBar 30s ease-out forwards',
                    width: '0%',
                  }}
                />
                <style>{`
                  @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 70%; }
                  }
                `}</style>
              </div>
            )}

            {/* Reading content */}
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[500px] p-4 border border-[#E8E0F0] rounded-xl font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]"
              />
            ) : (
              <div>
                <MarkdownReading text={streamedText} />
                {(isStreaming || isTranslating) && (
                  <span className="inline-block w-0.5 h-4 bg-[#7B5EA7] animate-pulse ml-0.5" />
                )}
              </div>
            )}

            {/* Action bar */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {!isStreaming && !isTranslating && !isEditing && (
                  <button
                    onClick={() => {
                      setEditText(streamedText)
                      setIsEditing(true)
                    }}
                    className="border border-[#E8E0F0] text-[#2C2C2C] rounded-lg px-4 py-2 text-sm hover:border-[#7B5EA7] transition-colors"
                  >
                    Edit
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => void handleSaveEdits()}
                      disabled={isSaving}
                      className="bg-[#7B5EA7] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#6B4E97] disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? 'Saving…' : 'Save edits'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="border border-[#E8E0F0] text-[#2C2C2C] rounded-lg px-4 py-2 text-sm hover:border-[#7B5EA7] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {!isStreaming && !isTranslating && !isEditing && (
                  <button
                    onClick={handleRegenerate}
                    className="border border-[#E8E0F0] text-[#2C2C2C] rounded-lg px-4 py-2 text-sm hover:border-[#7B5EA7] transition-colors"
                  >
                    Regenerate
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/clients/${id}/followup`}
                  className="border border-[#E8E0F0] text-[#7B5EA7] rounded-lg px-4 py-2 text-sm hover:border-[#7B5EA7] hover:bg-[#F5F0FB] transition-colors"
                >
                  Follow-up Q&A →
                </Link>
                {status !== 'finalised' && !isStreaming && !isTranslating && readingId && (
                  <button
                    onClick={() => void handleFinalise()}
                    className="bg-[#7B5EA7] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
                  >
                    Finalise →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share panel — shown after finalising */}
        {status === 'finalised' && shareToken && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-6">
            <p className="text-green-700 font-medium mb-3">✓ Reading finalised</p>
            <div className="bg-white border border-[#E8E0F0] rounded-xl px-4 py-3 font-mono text-sm text-[#888888] truncate mb-4">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/report/${shareToken}`
                : `/report/${shareToken}`}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => window.open(`/report/${shareToken}`, '_blank')}
                className="border border-[#E8E0F0] text-[#2C2C2C] rounded-xl px-5 py-2.5 text-sm hover:border-[#7B5EA7] transition-colors"
              >
                Open report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
