import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  
  // Remove porta caso esteja em ambiente local (ex: localhost:3000)
  const cleanHost = host.split(":")[0];

  // Subdomínio é tudo antes do primeiro ponto
  const parts = cleanHost.split(".");
  const subdomain = parts.length > 2 ? parts[0] : null;

  // Ignorar domínios principais
  const mainDomains = ["tifra", "www", "app"];

  if (subdomain && !mainDomains.includes(subdomain)) {
    // Injeta subdomínio nos searchParams
    url.searchParams.set("store", subdomain);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
