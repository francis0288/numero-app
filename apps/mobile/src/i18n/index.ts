import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import { locales, defaultLocale } from '@numero-app/i18n'

import enCommon from '@numero-app/i18n/src/locales/en/common.json'
import enScreens from '@numero-app/i18n/src/locales/en/screens.json'
import zhCommon from '@numero-app/i18n/src/locales/zh/common.json'
import zhScreens from '@numero-app/i18n/src/locales/zh/screens.json'
import viCommon from '@numero-app/i18n/src/locales/vi/common.json'
import viScreens from '@numero-app/i18n/src/locales/vi/screens.json'

const deviceLocale = getLocales()[0]?.languageCode ?? defaultLocale
const detectedLocale = locales.includes(deviceLocale as any) ? deviceLocale : defaultLocale

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: detectedLocale,
  fallbackLng: defaultLocale,
  resources: {
    en: { translation: { ...enCommon, ...enScreens } },
    zh: { translation: { ...zhCommon, ...zhScreens } },
    vi: { translation: { ...viCommon, ...viScreens } },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
