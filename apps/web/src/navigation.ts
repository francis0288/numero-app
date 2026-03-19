import { createSharedPathnamesNavigation } from 'next-intl/navigation'
import { locales } from '@numero-app/i18n'

const nav = createSharedPathnamesNavigation({ locales, localePrefix: 'as-needed' })

export const usePathname = nav.usePathname
export const useRouter = nav.useRouter
export const redirect = nav.redirect
