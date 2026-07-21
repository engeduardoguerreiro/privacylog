import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  LayoutTemplate,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import AgeGate from "@/components/AgeGate";
import { studioClinics } from "@/lib/studio/data";
import { pageMetadata } from "@/lib/seo";
import styles from "./home.module.css";

export const metadata = pageMetadata({
  title: "PrivacyLog | Presença premium para clínicas e casas",
  description:
    "PrivacyLog dá à sua clínica uma página premium, painel de modelos e serviços e presença no mapa. Descubra as casas parceiras.",
});

const services = [
  {
    icon: LayoutTemplate,
    title: "Página premium própria",
    text: "Uma landing sofisticada e discreta da sua casa, pronta para converter quem clica em 'saiba mais'.",
  },
  {
    icon: Users,
    title: "Painel de modelos e serviços",
    text: "Cadastre e atualize profissionais, fotos, horários e serviços quando quiser, sem depender de ninguém.",
  },
  {
    icon: MessageCircle,
    title: "Conversão no WhatsApp",
    text: "Botão direto para o cliente falar com a casa, com registro de cliques para você medir resultado.",
  },
  {
    icon: MapPin,
    title: "Presença no mapa",
    text: "Sua casa aparece no diretório e no mapa do PrivacyLog, ganhando descoberta além dos seus canais.",
  },
];

const planLabels: Record<string, string> = {
  black: "Black",
  premium: "Premium",
  essential: "Essencial",
};

export default function Home() {
  const clinics = studioClinics.slice(0, 6);

  return (
    <div className={styles.page}>
      <AgeGate />

      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          Privacy<b>Log</b>
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          <Link href="#servicos" className={styles.navLink}>
            Serviços
          </Link>
          <Link href="#clinicas" className={styles.navLink}>
            Clínicas
          </Link>
          <Link href="/lounge/mapa" className={styles.navLink}>
            Mapa
          </Link>
          <Link href="/login" className={styles.navLink}>
            Entrar
          </Link>
        </nav>

        <div className={styles.navActions}>
          <Link href="/studio" className={`${styles.btn} ${styles.btnPrimary}`}>
            Quero anunciar
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.container}>
            <span className={styles.kicker}>Presença premium para casas e clínicas</span>
            <h1 className={styles.heroTitle}>
              Sua casa com a apresentação que ela <em>merece</em>.
            </h1>
            <p className={styles.heroSub}>
              O PrivacyLog reúne clínicas e casas selecionadas em um só lugar:
              página própria premium, painel para gerir modelos e serviços e
              presença no mapa. Discrição, organização e conversão.
            </p>
            <div className={styles.heroActions}>
              <Link href="/studio" className={`${styles.btn} ${styles.btnPrimary}`}>
                Quero anunciar
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/lounge/mapa"
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Ver o mapa
              </Link>
            </div>
          </div>
        </section>

        <section id="servicos" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.kicker}>O que oferecemos</span>
              <h2 className={styles.sectionTitle}>
                Tudo que a sua casa precisa para ser encontrada e escolhida.
              </h2>
              <p className={styles.sectionText}>
                Uma estrutura pensada para o segmento, sem parecer amadora nem
                exposta. Você cuida da casa; a plataforma cuida da presença.
              </p>
            </div>

            <div className={styles.grid}>
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article key={service.title} className={styles.card}>
                    <span className={styles.cardIcon}>
                      <Icon size={22} />
                    </span>
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                    <p className={styles.cardText}>{service.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="clinicas" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.kicker}>Casas parceiras</span>
              <h2 className={styles.sectionTitle}>
                Clínicas e casas que já estão no PrivacyLog.
              </h2>
              <p className={styles.sectionText}>
                Cada casa tem sua página própria. Clique em uma para conhecer.
              </p>
            </div>

            <div className={styles.vitrineGrid}>
              {clinics.map((clinic) => (
                <Link
                  key={clinic.slug}
                  href={`/studio/${clinic.slug}`}
                  className={styles.clinicCard}
                >
                  <div className={styles.clinicImageWrap}>
                    {clinic.mainImageUrl ? (
                      <Image
                        src={clinic.mainImageUrl}
                        alt={clinic.name}
                        fill
                        sizes="(max-width: 760px) 100vw, 360px"
                        className={styles.clinicImage}
                      />
                    ) : null}
                    <span className={styles.planBadge}>
                      {planLabels[clinic.plan] || clinic.plan}
                    </span>
                  </div>
                  <div className={styles.clinicBody}>
                    <h3 className={styles.clinicName}>{clinic.name}</h3>
                    <span className={styles.clinicMeta}>
                      {clinic.neighborhood} · {clinic.city}
                    </span>
                    <p className={styles.clinicDesc}>{clinic.shortDescription}</p>
                    <span className={styles.clinicMore}>
                      Saiba mais
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.container}>
          <div className={styles.ctaBand}>
            <h2 className={styles.ctaTitle}>
              Coloque a sua casa no <span>PrivacyLog</span>.
            </h2>
            <p className={styles.ctaText}>
              Escolha um plano, crie sua página premium e comece a receber
              contatos qualificados. Onboarding simples, sem taxa de setup.
            </p>
            <div className={styles.ctaActions}>
              <Link
                href="/studio/cadastro"
                className={`${styles.btn} ${styles.btnChampagne}`}
              >
                Começar agora
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/studio/planos"
                className={`${styles.btn} ${styles.btnOutlineLight}`}
              >
                Ver planos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <span className={styles.footerBrand}>PrivacyLog © 2026</span>
            <nav className={styles.footerLinks} aria-label="Rodapé">
              <Link href="/studio">Studio</Link>
              <Link href="/lounge/mapa">Mapa</Link>
              <Link href="/login">Entrar</Link>
              <a href="mailto:contato@privacylog.com.br">Contato</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
