import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getMainSiteUrl, getProductFromHost, isLocalHost } from "@/lib/subdomain";
import { getStudioClinicSlugFromHost } from "@/lib/studio/domains";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const local = isLocalHost(host);

  if (pathname === "/auth/confirm" || pathname.startsWith("/auth/")) {
    return updateSession(request);
  }

  // Cada clinica publicada pode ter subdominio ou dominio proprio, que
  // continua servindo a pagina publica dela sem mudar a URL na barra.
  const studioClinicSlug = !local ? getStudioClinicSlugFromHost(host) : null;

  if (studioClinicSlug) {
    // Aponta direto para a pagina publica canonica. Passar pelo alias legado
    // /studio/[slug] geraria um redirect extra e, no dominio da clinica, um loop.
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/studio/clinicas/${studioClinicSlug}`;

    return updateSession(request, NextResponse.rewrite(rewriteUrl));
  }

  // Subdominios legados lounge./studio.: o site virou um so, em
  // privacylog.com.br. Redireciona permanente para o caminho equivalente,
  // preservando links antigos (lounge.privacylog.com.br/mapa ->
  // privacylog.com.br/lounge/mapa).
  if (!local) {
    const product = getProductFromHost(host);

    if (product === "lounge" || product === "studio") {
      const alreadyScoped = ["/lounge", "/studio"].some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );
      const scopedPath = alreadyScoped
        ? pathname
        : pathname === "/"
          ? `/${product}`
          : `/${product}${pathname}`;

      const target = new URL(scopedPath, getMainSiteUrl());
      target.search = request.nextUrl.search;

      return NextResponse.redirect(target, 308);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
