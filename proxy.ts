import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getProductFromHost, isLocalHost } from "@/lib/subdomain";
import { getStudioClinicSlugFromHost } from "@/lib/studio/domains";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const product = getProductFromHost(host);
  const pathname = request.nextUrl.pathname;
  const studioClinicSlug = !isLocalHost(host)
    ? getStudioClinicSlugFromHost(host)
    : null;

  if (pathname === "/auth/confirm" || pathname.startsWith("/auth/")) {
    return updateSession(request);
  }

  if (studioClinicSlug) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/studio/${studioClinicSlug}`;

    return updateSession(request, NextResponse.rewrite(rewriteUrl));
  }

  if (
    !isLocalHost(host) &&
    (product === "lounge" || product === "studio")
  ) {
    const productPrefix = `/${product}`;
    const isExplicitProductPath = ["/lounge", "/studio"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    const alreadyScoped =
      pathname === productPrefix || pathname.startsWith(`${productPrefix}/`);

    if (!alreadyScoped && !isExplicitProductPath) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname =
        pathname === "/" ? productPrefix : `${productPrefix}${pathname}`;

      return updateSession(request, NextResponse.rewrite(rewriteUrl));
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
