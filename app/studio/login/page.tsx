import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/app/login/AuthForm";
import { pageMetadata } from "@/lib/seo";
import styles from "@/app/login/auth.module.css";

export const metadata = pageMetadata({
  title: "Entrar | PrivacyLog",
  description: "Acesse o painel da sua casa no PrivacyLog.",
  product: "studio",
  path: "/login",
});

export default function StudioLoginPage() {
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
          <span className={styles.kicker}>Área da casa</span>
          <h1 className={styles.title}>Painel da sua casa</h1>
          <p className={styles.subtitle}>
            Gerencie modelos, disponibilidade e fotos da sua vitrine.
          </p>
        </div>

        <AuthForm allowSignup={false} nextPath="/studio/painel" product="studio" />

        <p className={styles.foot}>
          Ainda não tem conta?{" "}
          <Link href="/studio/cadastro">Cadastre a sua casa</Link>
        </p>
      </div>
    </main>
  );
}
