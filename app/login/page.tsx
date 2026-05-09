import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { getCurrentUser } from "@/lib/supabase/server";
import { normalizeSearchQuery } from "../forum/forum-utils";
import AuthForm from "./AuthForm";

interface PageProps {
  searchParams: Promise<{
    next?: string | string[];
  }>;
}

function getSafeNextPath(value: string | string[] | undefined) {
  const next = normalizeSearchQuery(value);

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/account";
  }

  return next;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="premium-shell px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-10 flex justify-center">
          <BrandLogo className="text-2xl" markSize={40} />
        </div>

        <section className="mb-8 text-center">
          <p className="premium-kicker">Acesso</p>
          <h1 className="mt-3 text-4xl font-black text-white">
            Entrar na conta
          </h1>
          <p className="mt-4 text-[#b8b8c8]">
            Use seu e-mail para acessar o fórum, perfil e áreas protegidas.
          </p>
        </section>

        <AuthForm nextPath={nextPath} />
      </div>
    </main>
  );
}
