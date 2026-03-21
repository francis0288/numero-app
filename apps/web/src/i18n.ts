import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '@numero-app/i18n'

import enCommon from '@numero-app/i18n/src/locales/en/common.json'
import enScreens from '@numero-app/i18n/src/locales/en/screens.json'
import enNumbers from '@numero-app/i18n/src/locales/en/numbers.json'
import enInterpretations from '@numero-app/i18n/src/locales/en/interpretations.json'
import enForecasting from '@numero-app/i18n/src/locales/en/forecasting.json'

import viCommon from '@numero-app/i18n/src/locales/vi/common.json'
import viScreens from '@numero-app/i18n/src/locales/vi/screens.json'
import viNumbers from '@numero-app/i18n/src/locales/vi/numbers.json'
import viInterpretations from '@numero-app/i18n/src/locales/vi/interpretations.json'
import viForecasting from '@numero-app/i18n/src/locales/vi/forecasting.json'

const allMessages = {
  en: { ...enCommon, ...enScreens, ...enNumbers, ...enInterpretations, ...enForecasting },
  vi: { ...viCommon, ...viScreens, ...viNumbers, ...viInterpretations, ...viForecasting },
}

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as any) ? locale : defaultLocale

  return {
    locale: safeLocale,
    // eslint-disable-next-line
    messages: (allMessages as any)[safeLocale] ?? (allMessages as any)[defaultLocale],
  }
})
