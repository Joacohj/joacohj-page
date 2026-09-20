import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

export function i18nProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

export function getLocale(pathname: string) {
  const locales = ["en", "es"];

  return locales.find(
    (locale) =>
      pathname === `/${locale}` ||
      pathname.startsWith(`/${locale}/`)
  );
}