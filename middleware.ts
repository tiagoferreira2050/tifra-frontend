import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // Ignorar arquivos estáticos e API
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // Ignorar painel
  if (cleanHost.startsWith("app.")) {
    return NextResponse.next();
  }

  // Ignorar domínio raiz
  if (cleanHost === mainDomain || cleanHost === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  // Obter subdomínio
  const subdomain = cleanHost.split(".")[0];

  // rewrite
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};

