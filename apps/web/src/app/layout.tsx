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
    <html lang="en">
      <body className={`${notoSans.className} bg-[#FDF6EC]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
