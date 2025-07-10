/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'sw'] as const;
export type Locale = typeof locales[number]; // "en" | "sw"
export const defaultLocale = 'en';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as any);
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default getRequestConfig(async ({ locale }) => {
  // Validate and ensure locale is one of our supported locales
  const validLocale: Locale = isValidLocale(locale) ? locale : defaultLocale;
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});