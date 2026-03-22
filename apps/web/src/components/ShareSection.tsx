'use client'

import React, { useState } from 'react'

interface ShareSectionProps {
  shareUrl: string
  clientId: string
  locale: string
}

export function ShareSection({ shareUrl: initialUrl, clientId }: ShareSectionProps) {
  const [shareUrl, setShareUrl] = useState(initialUrl)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevoke = async () => {
    if (!window.confirm('Xác nhận thu hồi? Liên kết hiện tại sẽ ngừng hoạt động ngay.')) return
    const res = await fetch(`/api/clients/${clientId}/revoke`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json() as { shareToken: string }
      const base = window.location.origin
      setShareUrl(`${base}/report/${data.shareToken}`)
    }
  }

  const reportPath = shareUrl.replace(/^https?:\/\/[^/]+/, '')

  return (
    <div style={{
      backgroundColor: 'rgba(196,146,42,0.06)',
      border: '0.5px solid rgba(196,146,42,0.2)',
      borderRadius: 16,
      padding: '16px',
    }}>
      <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gold)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)' }}>
        Chia sẻ báo cáo
      </h2>

      <div style={{
        backgroundColor: 'var(--color-white)',
        border: '0.5px solid var(--color-border)',
        borderRadius: 10,
        padding: '10px 12px',
        fontFamily: 'monospace',
        fontSize: 11,
        color: 'var(--color-mid)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: 12,
      }}>
        {shareUrl}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => void handleCopy()}
          style={{
            backgroundColor: 'var(--color-gold)',
            color: 'white',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {copied ? '✓ Đã sao chép' : 'Sao chép liên kết'}
        </button>

        <a
          href={reportPath}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            border: '0.5px solid var(--color-border)',
            color: 'var(--color-dark)',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 13,
            textDecoration: 'none',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Xem báo cáo →
        </a>

        <button
          type="button"
          onClick={() => void handleRevoke()}
          style={{
            color: 'var(--color-danger)',
            fontSize: 12,
            border: '0.5px solid rgba(163,45,45,0.3)',
            borderRadius: 8,
            padding: '6px 12px',
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            marginLeft: 'auto',
          }}
        >
          Thu hồi liên kết
        </button>
      </div>
    </div>
  )
}
