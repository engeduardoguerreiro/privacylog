import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
  getAuthProductFromPath,
  getProductLabel,
  hasProductAccess,
} from "@/lib/auth/product-access";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "./AuthForm";

function normalizeSearchQuery(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

interface PageProps {
  searchParams: Promise<{
    next: string | string[];
  }>;
}

function getSafeNextPath(value: string | string[] | undefined) {
  const next = normalizeSearchQuery(value);

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const product = getAuthProductFromPath(nextPath);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const allowed = await hasProductAccess(supabase, user, product);

    if (allowed) {
      redirect(nextPath);
    }

    await supabase.auth.signOut();
  }

  return (
    <main className="premium-shell px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-10 flex justify-center">
          <BrandLogo className="text-2xl" markSize={40} />
        </div>

        <section className="mb-8 text-center">
          <p className="premium-kicker">Acesso separado</p>
          <h1 className="mt-3 text-4xl font-black text-white">
            Entrar na conta
          </h1>
          <p className="mt-4 text-[#b8b8c8]">
            Use a conta cadastrada especificamente para {getProductLabel(product)}.
          </p>
        </section>

        <AuthForm nextPath={nextPath} product={product} />
      </div>
    </main>
  );
}
