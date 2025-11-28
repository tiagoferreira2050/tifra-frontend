import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const user = req.cookies.get("tifra_user")?.value;

  if (!user && req.nextUrl.pathname.startsWith("/panel")) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
