import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("tifra_token")?.value; // seu cookie de login

  const isAppDomain = request.nextUrl.hostname === "app.tifra.com.br";

  // Só aplica regras no subdomínio do app
  if (isAppDomain) {
    const url = request.nextUrl;

    // Se NÃO estiver logado e tentar acessar qualquer página que não seja login/signup
    if (!token && url.pathname !== "/login" && url.pathname !== "/signup") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Se estiver logado e tentar acessar login diretamente → manda para painel
    if (token && url.pathname === "/login") {
      url.pathname = "/panel";
      return NextResponse.redirect(url);
    }
  }

  // continua normal
  return NextResponse.next();
}
