import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const token = req.cookies.get("tifra_token")?.value;

  // ===============================
  // IGNORAR TUDO QUE NÃO É PÁGINA
  // ===============================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // ===============================
  // 🔐 PAINEL — app.tifra.com.br
  // ===============================
  if (cleanHost.startsWith("app.")) {
    // 🔓 Rotas públicas do painel
    if (pathname === "/login" || pathname === "/signup") {
      // se já estiver logado, evita loop indo pro login
      if (token) {
        return NextResponse.redirect(new URL("/panel", req.url));
      }
      return NextResponse.next();
    }

    // ❌ NÃO LOGADO tentando acessar painel
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ✅ LOGADO → acesso liberado
    return NextResponse.next();
  }

  // ===============================
  // DOMÍNIO RAIZ
  // ===============================
  if (
    cleanHost === mainDomain ||
    cleanHost === `www.${mainDomain}`
  ) {
    return NextResponse.next();
  }

  // ===============================
  // SUBDOMÍNIO → LOJA PÚBLICA
  // ===============================
  const subdomain = cleanHost.split(".")[0];
  const url = req.nextUrl.clone();
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"], // 🔥 matcher simples e seguro
};
