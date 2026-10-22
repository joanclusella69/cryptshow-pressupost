import { NextRequest, NextResponse } from "next/server";

// Protecció amb contrasenya de tota la web.
// La contrasenya es defineix a Vercel amb la variable SITE_PASSWORD.
// Si SITE_PASSWORD està buida, la web queda oberta (sense contrasenya).
export function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const pass = decoded.slice(decoded.indexOf(":") + 1);
      if (pass === password) return NextResponse.next();
    } catch {
      // capçalera mal formada: es torna a demanar la contrasenya
    }
  }

  return new NextResponse("Cal contrasenya per accedir al pressupost del Cryptshow.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Cryptshow Pressupost", charset="UTF-8"' },
  });
}

export const config = {
  // Protegeix totes les pàgines, excepte els arxius interns de Next.js.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
