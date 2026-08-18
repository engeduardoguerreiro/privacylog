import Link from "next/link";
import { Download, ShieldCheck, Smartphone, Share } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import SiteHeader from "../_home/SiteHeader";
import SiteFooter from "../_home/SiteFooter";
import styles from "../home.module.css";
import page from "./download.module.css";

export const metadata = pageMetadata({
  title: "Baixar o app do PrivacyLog",
  description:
    "Instale o PrivacyLog no seu celular: aplicativo Android para download direto e instalação em um toque no iPhone.",
});

// Link fixo: aponta sempre para a ultima versao publicada em Releases.
const APK_URL =
  "https://github.com/engeduardoguerreiro/privacylog/releases/latest/download/privacylog.apk";

export default function DownloadAppPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />

      <main>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.kicker}>Aplicativo</span>
              <h1 className={styles.sectionTitle}>Leve o PrivacyLog no celular</h1>
              <p className={styles.sectionText}>
                O app abre em tela cheia, sem barra de navegador, e fica com
                ícone próprio na sua tela inicial. O conteúdo é sempre o mais
                atual — não precisa atualizar o app a cada novidade.
              </p>
            </div>

            <div className={page.grid}>
              <article className={page.card}>
                <div className={page.cardHead}>
                  <Smartphone size={18} />
                  <span className={styles.kicker}>Android</span>
                </div>
                <h2 className={page.cardTitle}>Baixar o aplicativo</h2>
                <p className={page.cardText}>
                  Instalação direta pelo nosso site, sem passar por loja.
                </p>

                <a
                  href={APK_URL}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  rel="noopener"
                >
                  <Download size={18} />
                  Baixar o app (.apk)
                </a>

                <ol className={page.steps} style={{ marginTop: 18 }}>
                  <li>Toque em <strong>Baixar o app</strong> e confirme o download.</li>
                  <li>Abra o arquivo baixado.</li>
                  <li>
                    O Android vai pedir permissão para instalar apps desta
                    origem: toque em <strong>Configurações</strong> e ative
                    <strong> Permitir desta fonte</strong>.
                  </li>
                  <li>Volte e toque em <strong>Instalar</strong>.</li>
                </ol>

                <p className={page.note}>
                  <ShieldCheck size={14} style={{ verticalAlign: "-2px" }} /> O
                  aviso de “fonte desconhecida” aparece porque o app não é
                  distribuído pela Play Store. O arquivo é assinado por nós e
                  baixado do nosso próprio endereço oficial.
                </p>
              </article>

              <article className={page.card}>
                <div className={page.cardHead}>
                  <Share size={18} />
                  <span className={styles.kicker}>iPhone e iPad</span>
                </div>
                <h2 className={page.cardTitle}>Instalar em um toque</h2>
                <p className={page.cardText}>
                  No iOS a instalação é feita pelo próprio Safari — não há
                  arquivo para baixar.
                </p>

                <ol className={page.steps}>
                  <li>
                    Abra o <strong>privacylog.com.br</strong> no{" "}
                    <strong>Safari</strong>.
                  </li>
                  <li>
                    Toque no botão <strong>Compartilhar</strong> (o quadrado com
                    a seta para cima).
                  </li>
                  <li>
                    Escolha <strong>Adicionar à Tela de Início</strong>.
                  </li>
                  <li>
                    Confirme em <strong>Adicionar</strong>.
                  </li>
                </ol>

                <p className={page.note}>
                  Pronto: o ícone do PrivacyLog aparece junto dos seus outros
                  aplicativos e abre em tela cheia.
                </p>
              </article>
            </div>

            <p className={styles.sectionText} style={{ marginTop: 28 }}>
              Prefere continuar no navegador?{" "}
              <Link href="/">Voltar para a página inicial</Link>.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
