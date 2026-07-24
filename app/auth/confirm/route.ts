import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import {
  ensureProductProfile,
  getAuthProductFromPath,
} from "@/lib/auth/product-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/studio/painel";
  const redirectTo = request.nextUrl.clone();

  redirectTo.pathname = next.startsWith("/") ? next : "/studio/painel";
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await ensureProfileForNextPath(supabase, next);
      return NextResponse.redirect(redirectTo);
    }
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      await ensureProfileForNextPath(supabase, next);
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/studio/login";
  redirectTo.searchParams.set(
    "next",
    next.startsWith("/") ? next : "/studio/painel"
  );

  return NextResponse.redirect(redirectTo);
}

async function ensureProfileForNextPath(
  supabase: Awaited<ReturnType<typeof createClient>>,
  nextPath: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await ensureProductProfile({
    product: getAuthProductFromPath(nextPath),
    supabase,
    user,
  });
}
