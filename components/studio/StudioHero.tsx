import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const features = [
  { icon: UsersRound, label: "Pagina premium da sua clinica" },
  { icon: CalendarDays, label: "Modelos e disponibilidade" },
  { icon: MessageCircle, label: "Recebe contato pelo WhatsApp" },
  { icon: ShieldCheck, label: "Mais confianca para o paciente" },
];

const specialists = [
  { name: "Isabela R.", image: "/studio-demo/maison-modelo-1.webp" },
  { name: "Camila S.", image: "/studio-demo/maison-modelo-2.webp" },
  { name: "Larissa M.", image: "/studio-demo/maison-modelo-3.webp" },
];

export default function StudioHero() {
  return (
    <section className="studio-showcase-hero">
      <div className="studio-container studio-showcase-grid">
        <div className="studio-showcase-copy">
          <p className="studio-kicker">Com PrivacyLog Studio</p>
          <h1>
            Gestão premium para <span>clínicas</span> que querem atrair,
            organizar e <span>vender mais</span>
          </h1>
          <p>
            Uma plataforma completa para destacar sua clínica, gerenciar leads
            de modelo e disponibilidade, e receber agendamentos com mais
            segurança via WhatsApp.
          </p>
          <div className="studio-showcase-actions">
            <Link href="/studio/solicitar-site" className="studio-button primary">
              Quero cadastrar minha clínica
              <ArrowRight size={17} />
            </Link>
            <Link href="#recursos" className="studio-button ghost">
              Ver como funciona
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="studio-device-scene" aria-hidden="true">
          <div className="studio-laptop">
            <div className="studio-laptop-bar">
              <span>Privacy Log Studio</span>
              <span>Maison Aurora</span>
            </div>
            <div className="studio-laptop-content">
              <aside>
                <Image src="/brand/logo-studio.png" alt="" width={94} height={94} />
                <strong>Maison Aurora</strong>
                <small>Clínica premium</small>
              </aside>
              <section>
                <div className="studio-laptop-photo">
                  <Image
                    src="/studio-demo/maison-hero-reference.png"
                    alt=""
                    fill
                    sizes="520px"
                    priority
                  />
                </div>
                <div className="studio-laptop-copy">
                  <strong>Excelência em beleza, confidencialidade e resultados.</strong>
                  <span>Agenda sua avaliação personalizada com segurança.</span>
                </div>
                <p>Nossas especialistas</p>
                <div className="studio-specialist-row">
                  {specialists.map((specialist) => (
                    <article key={specialist.name}>
                      <Image src={specialist.image} alt="" fill sizes="120px" />
                      <span>{specialist.name}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="studio-phone-preview">
            <span>Voltar</span>
            <Image src="/brand/logo-studio.png" alt="" width={100} height={100} />
            <strong>Maison Aurora</strong>
            <p>Excelência, discrição e resultados que revelam sua melhor versão.</p>
            <button type="button">
              <Sparkles size={14} />
              Iniciar conversa
            </button>
            <small>Falar no WhatsApp</small>
            <div className="studio-phone-icons">
              <span>Serviços</span>
              <span>Especialistas</span>
              <span>Contato</span>
            </div>
          </div>
        </div>
      </div>

      <div className="studio-container studio-hero-features">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <span key={feature.label}>
              <Icon size={27} />
              {feature.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
