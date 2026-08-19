import Link from "next/link";
import { MoreVertical, Share, Smartphone, Sparkles } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import SiteHeader from "../_home/SiteHeader";
import SiteFooter from "../_home/SiteFooter";
import styles from "../home.module.css";
import page from "./download.module.css";

export const metadata = pageMetadata({
  title: "Instalar o app do PrivacyLog",
  description:
    "Instale o PrivacyLog no seu celular em poucos toques: ícone próprio na tela inicial, abertura em tela cheia e sempre atualizado.",
});

export default function InstallAppPage() {
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
                Instale direto pelo navegador, em poucos toques. O app ganha
                ícone próprio na sua tela inicial, abre em tela cheia — sem
                barra de navegador — e está sempre atualizado, sem ocupar
                espaço no aparelho.
              </p>
            </div>

            <div className={page.grid}>
              <article className={page.card}>
                <div className={page.cardHead}>
                  <Smartphone size={18} />
                  <span className={styles.kicker}>Android</span>
                </div>
                <h2 className={page.cardTitle}>Instalar pelo Chrome</h2>
                <p className={page.cardText}>
                  Leva menos de um minuto e não passa por nenhuma loja.
                </p>

                <ol className={page.steps}>
                  <li>
                    Abra o <strong>privacylog.com.br</strong> no{" "}
                    <strong>Chrome</strong>.
                  </li>
                  <li>
                    Toque no menu{" "}
                    <MoreVertical size={14} style={{ verticalAlign: "-2px" }} />{" "}
                    (três pontinhos), no canto superior direito.
                  </li>
                  <li>
                    Escolha <strong>Instalar aplicativo</strong> — em alguns
                    aparelhos aparece como{" "}
                    <strong>Adicionar à tela inicial</strong>.
                  </li>
                  <li>
                    Confirme em <strong>Instalar</strong>.
                  </li>
                </ol>

                <p className={page.note}>
                  Em muitos celulares o próprio Chrome sugere a instalação
                  sozinho, num aviso na parte de baixo da tela.
                </p>
              </article>

              <article className={page.card}>
                <div className={page.cardHead}>
                  <Share size={18} />
                  <span className={styles.kicker}>iPhone e iPad</span>
                </div>
                <h2 className={page.cardTitle}>Instalar pelo Safari</h2>
                <p className={page.cardText}>
                  No iOS a instalação é feita pelo próprio navegador.
                </p>

                <ol className={page.steps}>
                  <li>
                    Abra o <strong>privacylog.com.br</strong> no{" "}
                    <strong>Safari</strong>.
                  </li>
                  <li>
                    Toque no botão <strong>Compartilhar</strong> — o quadrado
                    com a seta para cima.
                  </li>
                  <li>
                    Role a lista e escolha{" "}
                    <strong>Adicionar à Tela de Início</strong>.
                  </li>
                  <li>
                    Confirme em <strong>Adicionar</strong>.
                  </li>
                </ol>

                <p className={page.note}>
                  Precisa ser o <strong>Safari</strong>: no iPhone, outros
                  navegadores não oferecem essa opção.
                </p>
              </article>
            </div>

            <p className={page.note} style={{ marginTop: 24 }}>
              <Sparkles size={14} style={{ verticalAlign: "-2px" }} /> Depois de
              instalado, o ícone do PrivacyLog fica junto dos seus outros
              aplicativos e abre igual a qualquer app — mas continua recebendo
              todas as novidades do site automaticamente.
            </p>

            <p className={styles.sectionText} style={{ marginTop: 24 }}>
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
