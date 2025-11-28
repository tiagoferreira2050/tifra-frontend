import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get("tifra-token"); // ajuste para o nome do seu cookie

  const isLogged = !!token;
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');
  const isRoot = req.nextUrl.pathname === '/';
  
  // 1) Se NÃO estiver logado e tentar acessar root → mandar pro login
  if (!isLogged && isRoot) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2) Se NÃO estiver logado e tentar acessar alguma rota protegida
  if (!isLogged && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 3) Se estiver logado e tentar acessar /login -> mandar pro painel
  if (isLogged && isLoginPage) {
    return NextResponse.redirect(new URL('/panel', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/panel/:path*',
    '/orders/:path*',
    '/products/:path*'
  ],
};
