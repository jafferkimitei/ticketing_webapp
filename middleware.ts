/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later.",
});

export async function middleware(request: Request) {
  const publicRoutes = ["/", "/b2c/events", "/api/mpesa/stk-push", "/api/mpesa/b2c/result", "/api/mpesa/stk-push/callback"];
  
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    if (request.nextUrl.pathname.startsWith("/api/mpesa")) {
      // Apply rate limiting to API routes
      try {
        await new Promise((resolve, reject) => {
          limiter(request as any, {} as any, (err) => (err ? reject(err) : resolve(null)));
        });
      } catch (err) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
    }
    return NextResponse.next();
  }

  const { userId, publicMetadata } = await getClerkUser(request);
  if (!userId) {
    return NextResponse.redirect(new URL("/b2c/register", request.url));
  }

  const role = publicMetadata?.role || "attendee";
  if (request.nextUrl.pathname.startsWith("/b2b") && role !== "organizer") {
    return NextResponse.redirect(new URL("/b2c/my-tickets", request.url));
  }
  if (request.nextUrl.pathname.startsWith("/b2c/my-tickets") && role === "organizer") {
    return NextResponse.redirect(new URL("/b2b/organizer/dashboard", request.url));
  }

  return NextResponse.next();
}

async function getClerkUser(request: Request) {
  // Simplified Clerk auth check (replace with actual Clerk middleware logic)
  return { userId: request.headers.get("x-clerk-user-id"), publicMetadata: {} };
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};