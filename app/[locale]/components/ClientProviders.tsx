/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface ClientProvidersProps {
  children: ReactNode;
  locale: string;
  messages: any;
  convexUrl: string;
  timeZone: string;
}

export default function ClientProviders({
  children,
  locale,
  messages,
  convexUrl,
  timeZone,
}: ClientProvidersProps) {
  const convex = new ConvexReactClient(convexUrl);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone} now={new Date()}>
      <ClerkProvider>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </ClerkProvider>
    </NextIntlClientProvider>
  );
}