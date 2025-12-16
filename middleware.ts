import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // ===============================
  // IGNORAR ARQUIVOS ESTÁTICOS / API
  // ===============================
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

  // ===============================
  // 🔐 PAINEL — app.tifra.com.br
  // ===============================
  if (cleanHost.startsWith("app.")) {
    const token = req.cookies.get("tifra_token")?.value;

    // ❌ NÃO LOGADO tentando acessar qualquer rota protegida
    if (!token && url.pathname !== "/login") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // ✅ JÁ LOGADO tentando acessar /login → manda pro painel
    if (token && url.pathname === "/login") {
      url.pathname = "/panel";
      return NextResponse.redirect(url);
    }

    // ✅ pode continuar normalmente
    return NextResponse.next();
  }

  // ===============================
  // DOMÍNIO RAIZ (tifra.com.br)
  // ===============================
  if (cleanHost === mainDomain || cleanHost === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  // ===============================
  // SUBDOMÍNIO → LOJA PÚBLICA
  // ===============================
  const subdomain = cleanHost.split(".")[0];
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
