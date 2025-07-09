import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { locales } from "../../i18n";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClerkProvider>
            <ConvexProvider client={convex}>{children}</ConvexProvider>
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}