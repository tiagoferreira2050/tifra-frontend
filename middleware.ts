import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token"); // Supabase session token
  
  const url = req.nextUrl.clone();

  // 1) Se o usuário NÃO estiver logado
  if (!token) {
    // Se ele tentar acessar / (raiz do app)
    if (url.pathname === "/") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Bloquear páginas protegidas
    if (url.pathname.startsWith("/panel")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 2) Se o usuário ESTIVER logado e acessar "/" → vai para o painel
  if (token && url.pathname === "/") {
    url.pathname = "/panel";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",        // Detecta acesso à raiz do app
    "/panel/:path*", 
    "/login",
  ],
};
