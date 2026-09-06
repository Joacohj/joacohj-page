import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ya tiene locale
  const hasLocale = locales.some(
    (locale) =>
      pathname === `/${locale}` ||
      pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    const url = request.nextUrl.clone();

    url.pathname = `/${defaultLocale}${pathname}`;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};