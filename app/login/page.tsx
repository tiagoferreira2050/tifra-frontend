import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Lê o cookie que você define no login
  const userCookie = req.cookies.get("tifra_user");

  // Se estiver no /login e já tiver cookie → manda para o painel
  if (path === "/login") {
    if (userCookie) {
      return NextResponse.redirect(new URL("/panel", req.url));
    }
    return NextResponse.next();
  }

  // Rotas protegidas
  const protectedRoutes = ["/panel", "/orders"];
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (isProtected && !userCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/orders/:path*", "/login"],
};
