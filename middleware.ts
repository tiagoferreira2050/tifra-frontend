import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "";

  // REMOVE porta quando local (ex: localhost:3000)
  const cleanHost = host.split(":")[0];

  // Seu domínio principal
  const mainDomain = "tifra.com.br";

  // Se for o domínio principal, segue normalmente
  if (cleanHost === mainDomain) {
    return NextResponse.next();
  }

  // Pega o subdomínio
  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  // Proteção
  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  // Reescreve a URL internamente para a rota com slug
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}
