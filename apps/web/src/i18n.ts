import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '@numero-app/i18n'

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as any) ? locale : defaultLocale

  const [common, screens, numbers, interpretations, forecasting] = await Promise.all([
    import(`../../node_modules/@numero-app/i18n/src/locales/${safeLocale}/common.json`),
    import(`../../node_modules/@numero-app/i18n/src/locales/${safeLocale}/screens.json`),
    import(`../../node_modules/@numero-app/i18n/src/locales/${safeLocale}/numbers.json`),
    import(`../../node_modules/@numero-app/i18n/src/locales/${safeLocale}/interpretations.json`),
    import(`../../node_modules/@numero-app/i18n/src/locales/${safeLocale}/forecasting.json`),
  ])

  return {
    locale: safeLocale,
    messages: {
      ...common.default,
      ...screens.default,
      ...numbers.default,
      ...interpretations.default,
      ...forecasting.default,
    },
  }
})
