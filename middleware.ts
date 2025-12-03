import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "";

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // Ignorar painel
  if (cleanHost.startsWith("app.")) {
    return NextResponse.next();
  }

  // Ignorar domínio principal
  if (cleanHost === mainDomain) {
    return NextResponse.next();
  }

  // Obter subdomínio
  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  // Redirecionar subcado para /store/[slug]
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}
