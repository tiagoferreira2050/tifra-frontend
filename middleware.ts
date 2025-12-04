import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // Painel
  if (cleanHost.startsWith(`app.`)) {
    return NextResponse.next();
  }

  // Domínio principal
  if (cleanHost === mainDomain || cleanHost === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  // Extrai subdomínio
  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  // Se não houver subdomínio, segue normalmente
  if (!subdomain) {
    return NextResponse.next();
  }

  // Reescreve para rota interna
  url.pathname = `/store/${subdomain}`;
  return NextResponse.rewrite(url);
}

// IGNORAR arquivos estáticos e APIs
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)",
  ],
};
