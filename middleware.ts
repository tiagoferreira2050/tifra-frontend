import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const token = req.cookies.get("tifra_token")?.value;

  // ===============================
  // IGNORAR ARQUIVOS / API
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
    const isPanelRoute = pathname.startsWith("/panel");
    const isPublicRoute = pathname === "/login" || pathname === "/signup";

    // 🔓 rotas públicas
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // 🔐 proteger APENAS /panel
    if (isPanelRoute && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

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
  // SUBDOMÍNIO → LOJA
  // ===============================
  const subdomain = cleanHost.split(".")[0];
  const url = req.nextUrl.clone();
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
