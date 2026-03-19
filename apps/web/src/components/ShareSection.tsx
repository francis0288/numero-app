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
    if (!window.confirm('Are you sure? The current link will stop working immediately.')) return
    const res = await fetch(`/api/clients/${clientId}/revoke`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json() as { shareToken: string }
      const base = window.location.origin
      setShareUrl(`${base}/report/${data.shareToken}`)
    }
  }

  const reportPath = shareUrl.replace(/^https?:\/\/[^/]+/, '')

  return (
    <div className="bg-[#F5F0FB] rounded-2xl p-5">
      <h2 className="text-[#7B5EA7] font-medium mb-3">Share report</h2>

      <div className="bg-white border border-[#E8E0F0] rounded-xl px-4 py-3 font-mono text-sm text-[#888888] truncate mb-3">
        {shareUrl}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="bg-[#7B5EA7] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy link'}
        </button>

        <a
          href={reportPath}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#E8E0F0] text-[#7B5EA7] rounded-xl px-4 py-2 text-sm hover:bg-white transition-colors"
        >
          View client report →
        </a>

        <button
          type="button"
          onClick={() => void handleRevoke()}
          className="text-red-500 text-sm border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors ml-auto"
        >
          Revoke link
        </button>
      </div>
    </div>
  )
}
