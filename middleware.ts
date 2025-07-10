/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { isValidLocale, locales, defaultLocale, Locale } from "./i18n/request";

// Edge Runtime compatible rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests per window

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0]?.trim() || 
            realIp || 
            cfConnectingIp || 
            'unknown';
  
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  for (const [k, v] of rateLimit.entries()) {
    if (v.resetTime < windowStart) {
      rateLimit.delete(k);
    }
  }
  
  const current = rateLimit.get(key);
  
  if (!current || current.resetTime < windowStart) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
}

export const middleware = clerkMiddleware(async (auth, request: NextRequest) => {
  const authResult = await auth();
  const userId = authResult.userId;
  const { pathname } = request.nextUrl;

  // Handle M-Pesa API rate limiting
  if (pathname.startsWith("/api/mpesa")) {
    const key = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(key);
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString(),
          }
        }
      );
    }
    
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString());
    return response;
  }

  // Redirect root to default locale
  if (pathname === "/") {
    const locale = await getPreferredLocale(request);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Validate locale
  const locale = pathname.split('/')[1];
  if (!isValidLocale(locale)) {
    const newPath = pathname.replace(/^\/[^/]+/, `/${defaultLocale}`);
    return NextResponse.redirect(new URL(newPath || `/${defaultLocale}`, request.url));
  }

  // Public routes
  const publicRoutes = ["/", "/b2c/events", "/api/mpesa/stk-push", "/api/mpesa/b2c/result", "/api/mpesa/stk-push/callback"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to register
  if (!userId) {
    const locale = pathname.split('/')[1] as Locale || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/b2c/register`, request.url));
  }

  // Fetch user metadata from Clerk
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role || "attendee";

  // Role-based routing
  if (pathname.startsWith(`/${locale}/b2b`) && role !== "organizer") {
    return NextResponse.redirect(new URL(`/${locale}/b2c/my-tickets`, request.url));
  }
  if (pathname.startsWith(`/${locale}/b2c/my-tickets`) && role === "organizer") {
    return NextResponse.redirect(new URL(`/${locale}/b2b/organizer/dashboard`, request.url));
  }

  return NextResponse.next();
});

async function getPreferredLocale(request: NextRequest): Promise<string> {
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0])
      .find(lang => locales.includes(lang as any));
    if (preferred) return preferred;
  }
  return defaultLocale;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};