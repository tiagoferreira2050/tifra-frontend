import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // pega cookie que vc cria no login
  const userCookie = req.cookies.get("tifra_user");

  // página de login liberada
  if (path === "/login") {
    if (userCookie) {
      return NextResponse.redirect(new URL("/panel", req.url));
    }
    return NextResponse.next();
  }

  // rotas protegidas
  const protectedRoutes = ["/panel", "/orders"];
  const isProtected = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  if (isProtected && !userCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/orders/:path*", "/login"],
};
