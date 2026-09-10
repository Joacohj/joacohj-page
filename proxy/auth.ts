import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function authProxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const url = request.nextUrl.clone();

    url.pathname = "/auth/sign-in";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export async function isAuthenticated() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return !!session;
}