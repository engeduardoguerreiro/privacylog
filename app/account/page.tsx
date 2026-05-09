import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import NicknameForm from "./NicknameForm";
import { getActiveNicknameLock } from "./nickname-lock";

interface PageProps {
  searchParams: Promise<{
    admin?: string | string[];
  }>;
}

export default async function AccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const isAdmin = isAdminUser(user);
  const adminRequired = Array.isArray(params.admin)
    ? params.admin[0] === "required"
    : params.admin === "required";
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, nickname_changed_at")
    .eq("id", user.id)
    .maybeSingle();
  const fallbackNickname = `usuario-${user.id.replaceAll("-", "").slice(0, 8)}`;
  const currentNickname =
    typeof profile?.nickname === "string" ? profile.nickname : fallbackNickname;
  const nicknameLockedUntil = getActiveNicknameLock(
    profile?.nickname_changed_at
  );

  return (
    <main className="premium-shell px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <BrandLogo className="mb-10 text-xl" markSize={36} />

        <section className="forum-form-card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#f6c453]/35 bg-[#f6c453]/15 text-[#f6c453]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="premium-kicker">Conta</p>
              <h1 className="mt-2 text-3xl font-black text-white">
                Perfil do usuário
              </h1>
            </div>
          </div>

          <div className="forum-form-card p-5">
            <p className="text-sm text-[#85859a]">E-mail privado</p>
            <p className="mt-1 font-semibold text-white">{user.email}</p>
            <p className="mt-2 text-xs text-[#85859a]">
              Visível apenas nesta tela da sua própria conta.
            </p>
          </div>

          <NicknameForm
            currentNickname={currentNickname}
            lockedUntil={nicknameLockedUntil}
          />

          {adminRequired && !isAdmin ? (
            <div className="mt-4 rounded-lg border border-[#dc2626]/40 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#ffb4b4]">
              Esta conta está logada, mas não tem permissão de administrador.
            </div>
          ) : null}

          <div
            className={`mt-4 rounded-lg border p-5 ${
              isAdmin
                ? "border-[#f6c453]/40 bg-[#f6c453]/10"
                : "border-[#2d2d44] bg-[#090912]"
            }`}
          >
            <p className="text-sm text-[#85859a]">Nível de acesso</p>
            <div className="mt-2 flex items-center gap-2">
              {isAdmin ? (
                <Crown size={19} className="text-[#f6c453]" />
              ) : (
                <ShieldCheck size={19} className="text-[#38bdf8]" />
              )}
              <p className="font-bold text-white">
                {isAdmin ? "Administrador" : "Usuário comum"}
              </p>
            </div>
            <p className="mt-2 text-sm text-[#b8b8c8]">
              {isAdmin
                ? "Você pode acessar o painel administrativo."
                : "Você pode usar o fórum e a conta, mas não acessa o admin."}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/forum" className="secondary-button">
              Ir para o fórum
            </Link>

            {isAdmin ? (
              <Link href="/admin" className="primary-button">
                <LayoutDashboard size={18} />
                Painel admin
              </Link>
            ) : null}

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#dc2626]/45 bg-[#dc2626]/80 px-5 font-bold text-white transition hover:bg-[#ef4444] sm:w-auto"
              >
                <LogOut size={18} />
                Sair
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
