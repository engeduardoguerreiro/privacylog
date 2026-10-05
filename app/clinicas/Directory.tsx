import Link from "next/link";
import ClinicsCarousel, { type CarouselClinic } from "../_home/ClinicsCarousel";
import SiteFooter from "../_home/SiteFooter";
import SiteHeader from "../_home/SiteHeader";
import home from "../home.module.css";
import type { LoungeCity } from "@/lib/lounge/cities";
import LocalCard, { type DirectoryLocal } from "./LocalCard";
import styles from "./clinicas.module.css";

/**
 * Lista completa de casas e locais ("Ver todas"). O carrossel da home mostra
 * so os destaques pagos; aqui entram todas: primeiro as casas assinantes,
 * depois todos os locais do mapa.
 */
export default function Directory({
  kicker,
  title,
  lead,
  cities,
  activeCitySlug,
  partners,
  locals,
}: {
  kicker: string;
  title: string;
  lead: string;
  cities: LoungeCity[];
  activeCitySlug?: string;
  partners: CarouselClinic[];
  locals: DirectoryLocal[];
}) {
  return (
    <div className={home.page}>
      <SiteHeader />
      <main>
        <section className={styles.intro}>
          <div className={home.container}>
            <span className={home.kicker}>{kicker}</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lead}>{lead}</p>

            <nav className={styles.cities} aria-label="Filtrar por cidade">
              <Link
                href="/clinicas"
                className={`${styles.chip} ${activeCitySlug ? "" : styles.chipActive}`}
              >
                Todas
              </Link>
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/clinicas/cidade/${city.slug}`}
                  className={`${styles.chip} ${
                    city.slug === activeCitySlug ? styles.chipActive : ""
                  }`}
                >
                  {city.name}
                  <span className={styles.chipCount}>{city.count}</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {partners.length ? (
          <section className={home.section}>
            <div className={home.container}>
              <div className={home.sectionHead}>
                <span className={home.kicker}>Casas parceiras</span>
                <h2 className={home.sectionTitle}>Páginas premium</h2>
                <p className={home.sectionText}>
                  Casas com página própria, modelos com foto real e disponibilidade
                  do dia.
                </p>
              </div>
              <ClinicsCarousel clinics={partners} />
            </div>
          </section>
        ) : null}

        <section className={`${home.section} ${home.sectionAlt}`}>
          <div className={home.container}>
            <div className={home.sectionHead}>
              <span className={home.kicker}>Todos os locais</span>
              <h2 className={home.sectionTitle}>Casas, clínicas e privês</h2>
            </div>
            <p className={styles.count}>
              {locals.length} {locals.length === 1 ? "local" : "locais"}
            </p>
            {locals.length ? (
              <div className={home.vitrineGrid}>
                {locals.map((local) => (
                  <LocalCard key={local.id} local={local} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Nenhum local cadastrado aqui ainda.</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
