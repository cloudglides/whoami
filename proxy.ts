import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Security headers are owned by Caddy in production (infra/nix/services.nix).
// This proxy only handles request IDs and auth redirects.

const PUBLIC_PATHS = [
  "/",
  "/api/auth",
  "/api/health",
  "/faq",
  "/how-it-works",
  "/submit",
  "/vote",
  "/track",
  "/recipient",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export async function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    const session = await auth();
    if (!session?.user) {
      const signInUrl = new URL("/api/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};