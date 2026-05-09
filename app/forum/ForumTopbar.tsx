import Link from "next/link";
import { LogOut } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { isAdminUser } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

export default async function ForumTopbar() {
  const user = await getCurrentUser();
  const isAdmin = isAdminUser(user);

  return (
    <header className="premium-header">
      <div className="site-container premium-header-inner">
        <BrandLogo className="text-xl" markSize={36} />

        <nav className="premium-nav" aria-label="Navegação do fórum">
          <Link href="/">Mapa</Link>
          <Link href="/forum">Fórum</Link>

          {user ? (
            <>
              {isAdmin ? <Link href="/admin">Admin</Link> : null}
              <Link href="/account">Conta</Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 border-0 bg-transparent"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link href="/login">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
