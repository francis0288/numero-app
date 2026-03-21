import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
})

export const config = {
  matcher: [
    '/((?!api|report|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
}
