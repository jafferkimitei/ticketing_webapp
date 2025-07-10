import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { Locale, locales } from "../../i18n/request";
import ClientProviders from "./components/ClientProviders";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error("Error loading messages:", error);
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ClientProviders
          locale={locale}
          messages={messages}
          convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}
        >
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

export { generateStaticParams } from "../../i18n/request";