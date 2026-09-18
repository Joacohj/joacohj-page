import { NextRequest, NextResponse } from "next/server";

import { i18nProxy } from "@/proxy/i18n";
import { authProxy } from "@/proxy/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Primero i18n
  const i18nResponse = i18nProxy(request);

  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  // Luego auth para dashboard
  if (
    pathname.startsWith("/en/dashboard") ||
    pathname.startsWith("/es/dashboard")
  ) {
    return authProxy(request);
  }

  return NextResponse.next();
}

export const config = {
matcher: [
    "/((?!api|images|_next/static|_next/image|favicon.ico).*)",
]
};