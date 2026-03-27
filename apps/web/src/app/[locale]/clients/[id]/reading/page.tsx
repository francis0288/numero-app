'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type ReadingMode = 'book' | 'warm' | 'practical' | 'truth'
type Status = 'draft' | 'finalised' | null

interface ModeOption {
  value: ReadingMode
  label: string
  sublabel: string
  icon: React.ReactElement
  isPrivate?: boolean
}

// Numbers that have MB book text in the DB (used for book-mode warning)
const KEYS_WITH_BOOK_TEXT = new Set<NumberKey>(['life_path', 'personal_year', 'pinnacle'])

const READING_MODES: ModeOption[] = [
  {
    value: 'book',
    label: 'Theo Sách',
    sublabel: 'Dựa hoàn toàn vào Michelle Buchanan & David Phillips',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    value: 'warm',
    label: 'Ấm Áp',
    sublabel: 'Nhân ái, trình bày thách thức nhẹ nhàng nhưng trung thực',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    value: 'practical',
    label: 'Thực Tiễn',
    sublabel: 'Tập trung vào hành động cụ thể trong cuộc sống thực tế',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    value: 'truth',
    label: 'Sự Thật',
    sublabel: 'Thẳng thắn, đầy đủ tích cực · tiêu cực · trung tính. Chỉ xem nội bộ.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    isPrivate: true,
  },
]

const MODE_DESCRIPTIONS: Record<ReadingMode, string> = {
  book:      'Bài đọc sẽ dựa hoàn toàn vào nội dung sách Michelle Buchanan & David Phillips.',
  warm:      'Bài đọc được viết với giọng ấm áp, trình bày trung thực nhưng nhẹ nhàng.',
  practical: 'Bài đọc tập trung vào hành động cụ thể và cách áp dụng thực tế.',
  truth:     '🔒 Bài đọc thẳng thắn toàn diện. Sẽ được lưu nội bộ, không thể chia sẻ.',
}

type NumberKey =
  | 'life_path' | 'destiny' | 'soul' | 'personality' | 'personal_year'
  | 'pinnacle' | 'maturity' | 'birth_day' | 'essence' | 'missing_numbers'
  | 'attitude' | 'bridge' | 'world_year'

const NUMBER_OPTIONS: Array<{ key: NumberKey; label: string; defaultChecked: boolean }> = [
  { key: 'life_path',       label: 'Số Đường Đời',            defaultChecked: true  },
  { key: 'destiny',         label: 'Số Sứ Mệnh',              defaultChecked: true  },
  { key: 'soul',            label: 'Số Linh Hồn',             defaultChecked: true  },
  { key: 'personality',     label: 'Số Nhân Cách',            defaultChecked: true  },
  { key: 'personal_year',   label: 'Số Năm Cá Nhân',          defaultChecked: true  },
  { key: 'pinnacle',        label: 'Số Đỉnh hiện tại',        defaultChecked: true  },
  { key: 'maturity',        label: 'Số Trưởng Thành',         defaultChecked: false },
  { key: 'birth_day',       label: 'Số Ngày Sinh',            defaultChecked: false },
  { key: 'essence',         label: 'Số Tinh Chất (Essence)',  defaultChecked: true  },
  { key: 'missing_numbers', label: 'Số Thiếu (Missing)',      defaultChecked: true  },
  { key: 'attitude',        label: 'Số Thái Độ',              defaultChecked: false },
  { key: 'bridge',          label: 'Số Kết Nối',              defaultChecked: false },
  { key: 'world_year',      label: 'Năm Thế Giới',            defaultChecked: false },
]

const LS_KEY = 'numeroapp_reading_number_selection'
const DEFAULT_SELECTION: NumberKey[] = NUMBER_OPTIONS.filter(o => o.defaultChecked).map(o => o.key)

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

  const [readingMode, setReadingMode] = useState<ReadingMode>('warm')
  const [isPrivate, setIsPrivate] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [bookModalInstructions, setBookModalInstructions] = useState('')
  const [selectedNumbers, setSelectedNumbers] = useState<NumberKey[]>(DEFAULT_SELECTION)
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
            reading: { aiNarrative: string | null; editedNarrative: string | null; isPrivate?: boolean; readingMode?: string }
            firstName: string
            shareToken?: string
          }
          setClientName(readingData.firstName)
          const narrative = readingData.reading.editedNarrative ?? readingData.reading.aiNarrative ?? ''
          setStreamedText(narrative)
          const priv = readingData.reading.isPrivate ?? false
          setIsPrivate(priv)
          if (latest.status === 'finalised' && readingData.shareToken && !priv) {
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as unknown
        if (Array.isArray(parsed)) {
          const valid = (parsed as string[]).filter(k =>
            NUMBER_OPTIONS.some(o => o.key === k)
          ) as NumberKey[]
          setSelectedNumbers(valid)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const handleNumberToggle = (key: NumberKey) => {
    setSelectedNumbers(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const handleGenerate = async (additionalInstructions?: string) => {
    console.log('handleGenerate called, clientId:', id)
    setIsStreaming(true)
    setStreamedText('')
    setReadingId(null)
    setStatus(null)
    setIsPrivate(readingMode === 'truth')

    try {
      const response = await fetch(`/api/clients/${id}/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readingMode,
          customFocus: showCustomFocus ? customFocus : undefined,
          selectedNumbers,
          additionalInstructions,
        }),
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
      setIsPrivate(false)
    }
  }

  const handleGenerateClick = () => {
    if (readingMode === 'book') {
      const missing = selectedNumbers.filter(k => !KEYS_WITH_BOOK_TEXT.has(k))
      if (missing.length > 0) {
        setBookModalInstructions('')
        setShowBookModal(true)
        return
      }
    }
    void handleGenerate()
  }

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

            {/* Mode cards 2×2 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {READING_MODES.map((mode) => {
                const selected = readingMode === mode.value
                return (
                  <button
                    key={mode.value}
                    onClick={() => setReadingMode(mode.value)}
                    style={{
                      position: 'relative',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${selected ? '#C4922A' : 'rgba(28,22,10,0.12)'}`,
                      backgroundColor: selected ? 'rgba(196,146,42,0.06)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {mode.isPrivate && (
                      <span style={{
                        position: 'absolute', top: 8, right: 8,
                        fontSize: 9, fontWeight: 600, color: 'var(--color-mid)',
                        backgroundColor: 'rgba(28,22,10,0.07)', borderRadius: 6,
                        padding: '2px 5px',
                      }}>
                        🔒 Riêng tư
                      </span>
                    )}
                    <div style={{ color: selected ? '#C4922A' : 'var(--color-mid)', marginBottom: 6 }}>
                      {mode.icon}
                    </div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 500,
                      color: 'var(--color-dark)', marginBottom: 3,
                    }}>
                      {mode.label}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--color-mid)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    } as React.CSSProperties}>
                      {mode.sublabel}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Mode description */}
            <p style={{
              fontSize: 12, color: 'var(--color-mid)', marginBottom: 16,
              paddingLeft: 4, lineHeight: 1.5,
            }}>
              {MODE_DESCRIPTIONS[readingMode]}
            </p>

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

            {/* Number selection */}
            <div className="mt-5 mb-2">
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--gold-main)', marginBottom: 12,
              }}>
                Số Liệu Đưa Vào Bài Đọc
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {NUMBER_OPTIONS.map(({ key, label }) => {
                  const checked = selectedNumbers.includes(key)
                  return (
                    <label
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 36, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleNumberToggle(key)}
                        className="sr-only"
                      />
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: checked ? '2px solid var(--gold-main)' : '1.5px solid var(--color-border)',
                        backgroundColor: checked ? 'var(--gold-bg)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="var(--gold-main)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateClick}
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
                {status !== 'finalised' && !isStreaming && !isTranslating && readingId && !isPrivate && (
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

        {/* Private reading indicator */}
        {status === 'finalised' && isPrivate && (
          <div className="rounded-2xl p-6 mt-6" style={{ backgroundColor: 'rgba(28,22,10,0.04)', border: '1px solid rgba(28,22,10,0.12)' }}>
            <p className="font-medium mb-1" style={{ color: 'var(--color-dark)' }}>🔒 Bài đọc nội bộ</p>
            <p className="text-sm" style={{ color: 'var(--color-mid)' }}>Riêng tư · Không thể chia sẻ</p>
          </div>
        )}

        {/* Share panel — shown after finalising */}
        {status === 'finalised' && !isPrivate && shareToken && !isRevoked && (
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
        {status === 'finalised' && !isPrivate && isRevoked && (
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

      {/* Book mode warning modal */}
      {showBookModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', borderRadius: 20,
            padding: 24, maxWidth: 460, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: 'var(--color-dark)', margin: '0 0 8px' }}>
              Thiếu dữ liệu sách
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: '0 0 10px' }}>
              Các số sau chưa có nội dung từ sách:
            </p>
            <ul style={{ margin: '0 0 14px', padding: '0 0 0 18px' }}>
              {selectedNumbers
                .filter(k => !KEYS_WITH_BOOK_TEXT.has(k))
                .map(k => (
                  <li key={k} style={{ fontSize: 13, color: 'var(--color-dark)', marginBottom: 3 }}>
                    {NUMBER_OPTIONS.find(o => o.key === k)?.label ?? k}
                  </li>
                ))}
            </ul>
            <p style={{ fontSize: 13, color: 'var(--color-mid)', margin: '0 0 8px' }}>
              Bạn có thể nhập hướng dẫn bổ sung cho các số này:
            </p>
            <textarea
              value={bookModalInstructions}
              onChange={(e) => setBookModalInstructions(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ví dụ: Với Số Linh Hồn, hãy dựa vào ý nghĩa chung của số đó..."
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1px solid var(--color-border)', borderRadius: 10,
                padding: '8px 12px', fontSize: 13, resize: 'none',
                color: 'var(--color-dark)', backgroundColor: 'var(--bg-tertiary)',
                outline: 'none', fontFamily: 'var(--font-ui)',
              }}
            />
            <p style={{ fontSize: 11, color: 'var(--color-mid)', textAlign: 'right', margin: '3px 0 16px' }}>
              {bookModalInstructions.length}/500
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBookModal(false)}
                style={{
                  border: '1px solid var(--color-border)', borderRadius: 10,
                  padding: '9px 18px', fontSize: 13, cursor: 'pointer',
                  color: 'var(--color-mid)', backgroundColor: 'transparent',
                }}
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  setShowBookModal(false)
                  void handleGenerate(bookModalInstructions || undefined)
                }}
                style={{
                  backgroundColor: 'var(--gold-main)', color: 'white',
                  border: 'none', borderRadius: 10, padding: '9px 18px',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Tiếp Tục Tạo Bài Đọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
