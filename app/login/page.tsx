import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getAuthProductFromPath,
  getProductLabel,
  hasProductAccess,
} from "@/lib/auth/product-access";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "./AuthForm";
import styles from "./auth.module.css";

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
    <main className={styles.page}>
      <Link href="/" className={styles.brand} aria-label="PrivacyLog">
        <Image
          src="/brand/privacylog-mark.png"
          alt=""
          width={44}
          height={46}
          className={styles.brandMark}
          priority
        />
        <span className={styles.brandText}>
          Privacy<b>Log</b>
        </span>
      </Link>

      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.kicker}>Acesso</span>
          <h1 className={styles.title}>Entrar na conta</h1>
          <p className={styles.subtitle}>
            Use a conta cadastrada para {getProductLabel(product)}.
          </p>
        </div>

        <AuthForm allowSignup={false} nextPath={nextPath} product={product} />

        <p className={styles.foot}>
          Quer anunciar sua casa?{" "}
          <Link href="/studio/cadastro">Cadastre a sua casa</Link>
        </p>
      </div>
    </main>
  );
}
