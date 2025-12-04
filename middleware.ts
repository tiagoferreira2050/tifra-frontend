import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";

  const cleanHost = host.split(":")[0];
  const mainDomain = "tifra.com.br";

  if (cleanHost.startsWith(`app.`)) {
    return NextResponse.next();
  }

  if (cleanHost === mainDomain || cleanHost === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  const subdomain = cleanHost.replace(`.${mainDomain}`, "");

  if (!subdomain) {
      return NextResponse.next();
  }

  url.pathname = `/store/${subdomain}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
