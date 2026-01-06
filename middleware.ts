import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = ["app", "api", "admin", "www"];

// 🔥 ROTAS GLOBAIS (NUNCA VIRAM /store)
const GLOBAL_ROUTES = [
  "/checkout",
  "/checkout/summary",
  "/login",
  "/signup",
  "/panel",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const token = req.cookies.get("tifra_token")?.value;

  // ===============================
  // 1️⃣ IGNORAR NEXT / API / ARQUIVOS
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

  // ===============================
  // 2️⃣ ROTAS GLOBAIS (checkout etc)
  // ===============================
  if (GLOBAL_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // ===============================
  // 3️⃣ PAINEL — app.tifra.com.br
  // ===============================
  if (cleanHost === `app.${mainDomain}`) {
    const isPublicRoute =
      pathname === "/login" || pathname === "/signup";

    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/panel") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // ===============================
  // 4️⃣ DOMÍNIO RAIZ
  // ===============================
  if (
    cleanHost === mainDomain ||
    cleanHost === `www.${mainDomain}`
  ) {
    return NextResponse.next();
  }

  // ===============================
  // 5️⃣ SUBDOMÍNIO → STORE
  // ===============================
  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  // 🔒 bloqueia subdomínios reservados
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();

  // 🔥 SOMENTE ROTAS DA LOJA VIRAM /store
  url.pathname =
    pathname === "/"
      ? `/store/${subdomain}`
      : `/store/${subdomain}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
