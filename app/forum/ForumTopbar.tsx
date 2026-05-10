import Link from "next/link";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Sparkles,
  UserCircle,
} from "lucide-react";
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
          <Link href="/" className="premium-nav-link nav-link-map">
            <MapPin size={16} />
            Mapa
          </Link>
          <Link href="/forum" className="premium-nav-link nav-link-forum">
            <MessageSquare size={16} />
            Fórum
          </Link>

          {user ? (
            <>
              {isAdmin ? (
                <Link href="/admin" className="premium-nav-link">
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              ) : null}
              <Link href="/account" className="premium-nav-link">
                <UserCircle size={16} />
                Conta
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="premium-nav-link border-0 bg-transparent"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="premium-nav-link nav-link-login">
              <LogIn size={16} />
              Entrar
            </Link>
          )}

          <a
            href="mailto:contato@privacylog.com.br?subject=Quero%20ser%20Premium%20no%20PrivacyLog"
            className="premium-nav-cta"
          >
            <Sparkles size={16} />
            Seja Premium
          </a>
        </nav>
      </div>
    </header>
  );
}
