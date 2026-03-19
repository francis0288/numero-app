'use client'

import React, { useState, useRef } from 'react'
import { NavBar } from '@/components/NavBar'
import { useParams } from 'next/navigation'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0F0] p-6 mb-6">
      <h2 className="text-base font-medium text-[#2C2C2C] mb-5">{title}</h2>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const params = useParams()
  const locale = (params.locale as string) ?? 'en'

  // Profile
  const [name, setName] = useState('')
  const [brandingFooter, setBrandingFooter] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  // Logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSaved, setLogoSaved] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // API key
  const [apiKey, setApiKey] = useState('')
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [apiKeyError, setApiKeyError] = useState('')

  // Load initial user data
  React.useEffect(() => {
    fetch('/api/clients')
      .then(() => {}) // just to warm up auth
      .catch(() => {})
    fetch('/api/settings/profile')
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json() as { name?: string; email?: string; logoUrl?: string; brandingFooter?: string }
          setName(d.name ?? '')
          setBrandingFooter(d.brandingFooter ?? '')
          if (d.logoUrl) setLogoPreview(d.logoUrl)
        }
      })
      .catch(() => {})
  }, [])

  const saveProfile = async () => {
    const res = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, brandingFooter }),
    })
    if (res.ok) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setLogoPreview(dataUrl)
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: dataUrl }),
      })
      if (res.ok) {
        setLogoSaved(true)
        setTimeout(() => setLogoSaved(false), 2000)
      }
    }
    reader.readAsDataURL(file)
  }

  const saveApiKey = async () => {
    setApiKeyError('')
    const res = await fetch('/api/settings/apikey', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })
    if (res.ok) {
      setApiKeySaved(true)
      setApiKey('')
      setTimeout(() => setApiKeySaved(false), 2000)
    } else {
      const d = await res.json() as { error?: string }
      setApiKeyError(d.error ?? 'Failed to save key')
    }
  }

  const exportData = () => {
    window.open('/api/settings/export', '_blank')
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <NavBar locale={locale} />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-medium text-[#2C2C2C] mb-6">Settings</h1>

        {/* Profile */}
        <Card title="Profile">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#E8E0F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-1">Branding footer</label>
              <input
                value={brandingFooter}
                onChange={(e) => setBrandingFooter(e.target.value)}
                placeholder="e.g. yoursite.com | hello@yoursite.com"
                className="w-full border border-[#E8E0F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]"
              />
            </div>
            <button
              type="button"
              onClick={() => void saveProfile()}
              className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
            >
              {profileSaved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>
        </Card>

        {/* Branding / Logo */}
        <Card title="Logo">
          <div className="flex items-center gap-4 mb-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-16 h-16 rounded-full object-cover border border-[#E8E0F0]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#F5F0FB] flex items-center justify-center text-[#7B5EA7] text-2xl">
                ✨
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="bg-[#7B5EA7] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
              >
                {logoSaved ? '✓ Uploaded' : 'Upload logo'}
              </button>
              <p className="text-xs text-[#888888] mt-1">Appears on client report cover</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoSelect}
          />
        </Card>

        {/* API Key */}
        <Card title="Anthropic API Key">
          <div className="space-y-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full border border-[#E8E0F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]"
            />
            {apiKeyError && <p className="text-red-500 text-xs">{apiKeyError}</p>}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void saveApiKey()}
                className="bg-[#7B5EA7] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#6B4E97] transition-colors"
              >
                {apiKeySaved ? '✓ Saved' : 'Update key'}
              </button>
              <p className="text-xs text-[#888888]">
                Get your key at{' '}
                <a
                  href="https://console.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7B5EA7] hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Data export */}
        <Card title="Data">
          <p className="text-sm text-[#888888] mb-4">
            Download all your client data as a spreadsheet-compatible CSV file.
          </p>
          <button
            type="button"
            onClick={exportData}
            className="border border-[#E8E0F0] text-[#2C2C2C] rounded-xl px-5 py-2.5 text-sm hover:border-[#7B5EA7] transition-colors"
          >
            Export all client data as CSV
          </button>
        </Card>
      </main>
    </div>
  )
}
