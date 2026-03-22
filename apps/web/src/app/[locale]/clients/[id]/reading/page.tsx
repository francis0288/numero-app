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
              <h2
                className="font-medium text-lg mt-8 mb-3 pb-2 border-b"
                style={{ color: 'var(--gold-main)', borderColor: 'var(--border-subtle)' }}
              >
                {heading}
              </h2>
            )}
            {paragraphs.map((para, j) => (
              <p key={j} className="leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
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
  const [isRevoked, setIsRevoked] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
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

  const handleRevoke = async () => {
    try {
      const res = await fetch(`/api/clients/${id}/revoke`, { method: 'POST' })
      if (res.ok) {
        setShareToken(null)
        setIsRevoked(true)
        setShowRevokeConfirm(false)
      }
    } catch {
      // ignore
    }
  }

  const handleRegenerateLink = async () => {
    try {
      const res = await fetch(`/api/clients/${id}/share`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { shareToken: string }
        setShareToken(data.shareToken)
        setIsRevoked(false)
      }
    } catch {
      // ignore
    }
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

      // eslint-disable-next-line no-constant-condition
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
    if (window.confirm('Tạo bản đọc mới? Phiên bản hiện tại sẽ bị thay thế.')) {
      setStreamedText('')
      setReadingId(null)
      setStatus(null)
      setVersion(null)
    }
  }

  const tones: Array<{ value: Tone; label: string }> = [
    { value: 'warm', label: '✨ Ấm Áp' },
    { value: 'analytical', label: '📊 Phân Tích' },
    { value: 'spiritual', label: '🌙 Tâm Linh' },
    { value: 'practical', label: '⚡ Thực Tế' },
  ]

  const showGenerationPanel = !streamedText && !isStreaming
  const showReadingDisplay = streamedText || isStreaming

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <main className="max-w-[800px] mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/clients/${id}/profile`}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Quay lại hồ sơ
            </Link>
            {clientName && (
              <h1 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>{clientName}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {version !== null && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: 'var(--gold-bg)', color: 'var(--gold-main)' }}
              >
                Phiên bản {version}
              </span>
            )}
            {status === 'draft' && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-1 rounded-full">
                Bản nháp
              </span>
            )}
            {status === 'finalised' && (
              <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-full">
                Đã hoàn tất
              </span>
            )}
          </div>
        </div>

        {/* Section A — Generation panel */}
        {showGenerationPanel && (
          <div
            className="rounded-2xl shadow-sm border p-6"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <h2 className="font-medium text-lg mb-5" style={{ color: 'var(--gold-main)' }}>Tạo Bản Đọc AI</h2>

            {/* Tone selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tones.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTone(value)}
                  className={
                    tone === value
                      ? 'text-white rounded-full px-4 py-2 text-sm font-medium'
                      : 'border rounded-full px-4 py-2 text-sm cursor-pointer'
                  }
                  style={
                    tone === value
                      ? { backgroundColor: 'var(--gold-main)' }
                      : { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }
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
                className="text-sm"
                style={{ color: 'var(--gold-main)' }}
              >
                + Thêm chủ đề tập trung (tùy chọn)
              </button>
            ) : (
              <textarea
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="VD: Cô ấy đang cân nhắc thay đổi nghề nghiệp trong năm nay..."
                rows={3}
                className="w-full mt-3 p-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-subtle)', '--tw-ring-color': 'var(--gold-main)' } as React.CSSProperties}
              />
            )}

            <button
              type="button"
              onClick={() => void handleGenerate()}
              className="w-full mt-6 text-white rounded-xl py-3 font-medium transition-colors"
              style={{ backgroundColor: 'var(--gold-main)' }}
            >
              Tạo Bản Đọc
            </button>
          </div>
        )}

        {/* Language bar — shown when a reading exists */}
        {showReadingDisplay && (
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Ngôn ngữ:</span>
              <span
                className="rounded-full px-3 py-1 text-sm"
                style={{ backgroundColor: 'var(--gold-bg)', color: 'var(--gold-main)' }}
              >
                {displayLanguage === 'vi' ? 'Tiếng Việt' : 'English'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isTranslating ? (
                <span className="text-xs animate-pulse" style={{ color: 'var(--gold-main)' }}>Đang dịch…</span>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Dịch sang:</span>
              )}
              {(['vi', 'en'] as const).map((lang) => {
                const labels = { vi: 'Việt', en: 'EN' }
                const isActive = displayLanguage === lang
                return (
                  <button
                    key={lang}
                    type="button"
                    disabled={isActive || isTranslating}
                    onClick={() => void handleTranslate(lang)}
                    className={
                      isActive
                        ? 'text-white rounded-full px-3 py-1 text-xs font-medium cursor-default'
                        : 'border rounded-full px-3 py-1 text-xs transition-colors disabled:opacity-40'
                    }
                    style={
                      isActive
                        ? { backgroundColor: 'var(--gold-main)' }
                        : { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }
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
          <div
            className="rounded-2xl shadow-sm border p-6 md:p-8"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            {/* Progress bar while streaming or translating */}
            {(isStreaming || isTranslating) && (
              <div className="w-full h-1 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: 'var(--border-subtle)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: 'var(--gold-main)',
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
                className="w-full min-h-[500px] p-4 border rounded-xl font-mono text-sm resize-y focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-subtle)', '--tw-ring-color': 'var(--gold-main)' } as React.CSSProperties}
              />
            ) : (
              <div>
                <MarkdownReading text={streamedText} />
                {(isStreaming || isTranslating) && (
                  <span className="inline-block w-0.5 h-4 animate-pulse ml-0.5" style={{ backgroundColor: 'var(--gold-main)' }} />
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
                    className="border rounded-lg px-4 py-2 text-sm transition-colors"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    Chỉnh sửa
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => void handleSaveEdits()}
                      disabled={isSaving}
                      className="text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: 'var(--gold-main)' }}
                    >
                      {isSaving ? 'Đang lưu…' : 'Lưu chỉnh sửa'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="border rounded-lg px-4 py-2 text-sm transition-colors"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                      Hủy
                    </button>
                  </>
                )}
                {!isStreaming && !isTranslating && !isEditing && (
                  <button
                    onClick={handleRegenerate}
                    className="border rounded-lg px-4 py-2 text-sm transition-colors"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    Tạo lại
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/clients/${id}/followup`}
                  className="border rounded-lg px-4 py-2 text-sm transition-colors"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--gold-main)' }}
                >
                  Hỏi đáp thêm →
                </Link>
                {status !== 'finalised' && !isStreaming && !isTranslating && readingId && (
                  <button
                    onClick={() => void handleFinalise()}
                    className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'var(--gold-main)' }}
                  >
                    Hoàn tất →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share panel — shown after finalising */}
        {status === 'finalised' && shareToken && !isRevoked && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-6">
            <p className="text-green-700 font-medium mb-3">✓ Đã hoàn tất bản đọc</p>
            <div
              className="border rounded-xl px-4 py-3 font-mono text-sm truncate mb-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              {typeof window !== 'undefined'
                ? `${window.location.origin}/report/${shareToken}`
                : `/report/${shareToken}`}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--gold-main)' }}
              >
                {copied ? '✓ Đã sao chép!' : 'Sao chép liên kết'}
              </button>
              <button
                type="button"
                onClick={() => window.open(`/report/${shareToken}`, '_blank')}
                className="border rounded-xl px-5 py-2.5 text-sm transition-colors"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                Xem báo cáo
              </button>
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="text-red-500 border border-red-300 bg-transparent rounded-lg px-4 py-2 text-sm hover:bg-red-50 ml-auto"
              >
                🔒 Thu hồi liên kết
              </button>
            </div>

            {/* Revoke confirmation dialog */}
            {showRevokeConfirm && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium mb-1">Bạn có chắc muốn thu hồi liên kết này không?</p>
                <p className="text-red-400 text-xs mb-3">Liên kết hiện tại sẽ ngừng hoạt động ngay lập tức. Khách hàng sẽ không thể xem báo cáo nữa.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevokeConfirm(false)}
                    className="border rounded-lg px-4 py-2 text-sm"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRevoke()}
                    className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    Thu hồi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revoked state */}
        {status === 'finalised' && isRevoked && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-6">
            <p className="text-red-600 font-medium mb-1">🔒 Liên kết đã bị thu hồi</p>
            <p className="text-red-400 text-sm mb-4">Khách hàng không thể truy cập báo cáo. Tạo liên kết mới để chia sẻ lại.</p>
            <button
              type="button"
              onClick={() => void handleRegenerateLink()}
              className="text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--gold-main)' }}
            >
              Tạo liên kết mới
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
