import React from 'react'
import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const notoSans = Noto_Sans({
  weight: ['400', '500'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-noto-sans',
})

export const metadata: Metadata = {
  title: 'NumeroApp',
  description: 'Professional numerology reading tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()` }} />
      </head>
      <body className={notoSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
