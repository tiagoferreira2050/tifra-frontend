import { NextResponse } from "next/server";

export function middleware(req) {
  const user = req.cookies.get("tifra_user")?.value;

  if (!user && req.nextUrl.pathname.startsWith("/panel")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
