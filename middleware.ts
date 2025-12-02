// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // 1. Host principal (tifra.com.br) → abre a landing ou homepage
  if (host === "tifra.com.br") {
    return NextResponse.next();
  }

  // 2. Painel / admin / app → redirecionar para /panel
  if (host.startsWith("panel.")) {
    url.pathname = "/panel";
    return NextResponse.rewrite(url);
  }

  // 3. QUALQUER OUTRO subdomínio = loja
  const subdomain = host.replace(".tifra.com.br", "");

  // Se for sem subdomínio, só segue
  if (!subdomain || subdomain === "www") return NextResponse.next();

  // Reescreve rota interna para carregar a página da loja
  url.pathname = `/_store/${subdomain}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Aplica middleware a todas rotas menos:
     * /_next, /api, /static, /public etc
     */
    "/((?!_next|api|static|.*\\.).*)",
  ],
};
