import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':    'var(--bg-primary)',
        'bg-secondary':  'var(--bg-secondary)',
        'bg-card':       'var(--bg-card)',
        'border-subtle': 'var(--border-subtle)',
        'gold':          'var(--gold-main)',
        'gold-bright':   'var(--gold-bright)',
        'gold-muted':    'var(--gold-muted)',
        'gold-bg':       'var(--gold-bg)',
        'purple':        'var(--purple-main)',
        'purple-bright': 'var(--purple-bright)',
        'amber':         'var(--amber-main)',
        'text-primary':  'var(--text-primary)',
        'text-secondary':'var(--text-secondary)',
        'text-muted':    'var(--text-muted)',
      },
    },
  },
  plugins: [],
}

export default config
