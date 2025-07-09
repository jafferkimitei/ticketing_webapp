
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime compatible rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests per window

function getRateLimitKey(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use the first available IP
  const ip = forwarded?.split(',')[0]?.trim() || 
            realIp || 
            cfConnectingIp || 
            'unknown';
  
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  for (const [k, v] of rateLimit.entries()) {
    if (v.resetTime < windowStart) {
      rateLimit.delete(k);
    }
  }
  
  const current = rateLimit.get(key);
  
  if (!current || current.resetTime < windowStart) {
    // First request in window or window expired
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
}

export async function middleware(request: NextRequest) {
  const publicRoutes = ["/", "/b2c/events", "/api/mpesa/stk-push", "/api/mpesa/b2c/result", "/api/mpesa/stk-push/callback"];
  const pathname = request.nextUrl.pathname;
  
  if (publicRoutes.includes(pathname)) {
    // Apply rate limiting to M-Pesa API routes
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
      
      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString());
      
      return response;
    }
    
    return NextResponse.next();
  }

  const { userId, publicMetadata } = await getClerkUser(request);
  if (!userId) {
    return NextResponse.redirect(new URL("/b2c/register", request.url));
  }

  const role = (publicMetadata as { role?: string })?.role || "attendee";
  if (pathname.startsWith("/b2b") && role !== "organizer") {
    return NextResponse.redirect(new URL("/b2c/my-tickets", request.url));
  }
  if (pathname.startsWith("/b2c/my-tickets") && role === "organizer") {
    return NextResponse.redirect(new URL("/b2b/organizer/dashboard", request.url));
  }

  return NextResponse.next();
}

async function getClerkUser(request: NextRequest) {
  return { userId: request.headers.get("x-clerk-user-id"), publicMetadata: {} };
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};