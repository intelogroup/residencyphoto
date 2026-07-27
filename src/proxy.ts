import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { checkAuthRateLimit, getClientIp } from "@/lib/rate-limit";

const protectedRoutes = auth.middleware({ loginUrl: "/auth/sign-in" });

// ponytail: only rate-limit credential-guessing endpoints, not session polling (get-session, get_token, etc.)
const rateLimitedAuthPaths = ["/api/auth/sign-in", "/api/auth/sign-up", "/api/auth/request-password-reset", "/api/auth/reset-password"];

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const needsRateLimit = rateLimitedAuthPaths.some((path) => request.nextUrl.pathname.startsWith(path));
    if (needsRateLimit) {
      const { success } = await checkAuthRateLimit(getClientIp(request));
      if (!success) {
        return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
      }
    }
    return NextResponse.next();
  }
  return protectedRoutes(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/admin/:path*", "/api/auth/:path*"],
};
