export const locales = ['en', 'zh', 'vi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'vi'
