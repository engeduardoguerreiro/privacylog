import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { getApprovedStudioClinics } from "@/lib/studio/db";

const fallbackCases = [
  {
    name: "Villa Veras",
    location: "Campinas - SP",
    image: "/studio-demo/maison-atmosfera-2.webp",
    text: "Organização que gera confiança e agenda cheia todos os dias.",
    rating: "4,8",
  },
  {
    name: "Espaço Claris",
    location: "Ribeirão Preto - SP",
    image: "/studio-demo/maison-atmosfera-3.webp",
    text: "Mais conteúdo, visibilidade e estrutura para um atendimento premium.",
    rating: "4,9",
  },
];

export default async function ClinicCarousel() {
  const clinics = await getApprovedStudioClinics();
  const maison = clinics.find((clinic) => clinic.slug === "maison-aurora") ?? clinics[0];
  const cases = [
    {
      name: maison?.name || "Maison Aurora",
      location: maison ? `${maison.city} - ${maison.state}` : "São Paulo - SP",
      image:
        maison?.mainImageUrl ||
        maison?.photos[0] ||
        "/studio-demo/maison-hero-reference.png",
      text: "Aumento de 210% nas solicitações via WhatsApp em 3 meses com PrivacyLog.",
      rating: "4,9",
      href: maison ? `/studio/clinicas/${maison.slug}` : "/studio/clinicas/maison-aurora",
    },
    ...fallbackCases.map((item) => ({ ...item, href: "/studio/solicitar-site" })),
  ];

  return (
    <section className="studio-results-section" id="exemplos">
      <div className="studio-container">
        <div className="studio-centered-heading">
          <p className="studio-kicker">Conecte sua excelência com a PrivacyLog</p>
          <h2>Presença premium que gera resultados</h2>
          <p>Veja como nossa plataforma transforma a visibilidade da sua clínica.</p>
        </div>

        <div className="studio-case-grid">
          {cases.map((item) => (
            <article className="studio-case-card" key={item.name}>
              <Link href={item.href} className="studio-case-image" aria-label={`Ver ${item.name}`}>
                <Image src={item.image} alt="" fill sizes="360px" />
              </Link>
              <div className="studio-case-body">
                <div>
                  <h3>{item.name}</h3>
                  <span>{item.location}</span>
                </div>
                <strong>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={13} fill="currentColor" />
                  ))}
                  {item.rating}
                </strong>
                <p>{item.text}</p>
                <Link href={item.href}>
                  Ver exemplo
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <Link href="/studio/clinicas" className="studio-all-cases">
          Ver todos os cases
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
