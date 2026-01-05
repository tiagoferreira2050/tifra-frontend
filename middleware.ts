import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = [
  "app",
  "api",
  "admin",
  "www",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const token = req.cookies.get("tifra_token")?.value;

  // ===============================
  // 1️⃣ IGNORAR ROTAS INTERNAS / ARQUIVOS
  // ===============================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // ===============================
  // 2️⃣ PAINEL — app.tifra.com.br
  // ===============================
  if (cleanHost === `app.${mainDomain}`) {
    const isPanelRoute = pathname.startsWith("/panel");
    const isPublicRoute =
      pathname === "/login" || pathname === "/signup";

    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isPanelRoute && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // ===============================
  // 3️⃣ DOMÍNIO RAIZ
  // ===============================
  if (
    cleanHost === mainDomain ||
    cleanHost === `www.${mainDomain}`
  ) {
    return NextResponse.next();
  }

  // ===============================
  // 4️⃣ SUBDOMÍNIO → LOJA PÚBLICA
  // ===============================
  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  // 🔒 bloqueia subdomínios reservados
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();

  url.pathname =
    pathname === "/"
      ? `/store/${subdomain}`
      : `/store/${subdomain}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
