import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "";
  const pathname = url.pathname;

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  // 🔹 Ignorar assets estáticos, favicon e API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 🔹 Ignorar painel
  if (cleanHost.startsWith("app.")) {
    return NextResponse.next();
  }

  // 🔹 Ignorar domínio principal
  if (cleanHost === mainDomain) {
    return NextResponse.next();
  }

  // 🔹 Obter subdomínio
  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  // 🔹 Reescrever somente página da loja
  url.pathname = `/store/${subdomain}`;

  return NextResponse.rewrite(url);
}
