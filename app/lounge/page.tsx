import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRoundCheck,
} from "lucide-react";
import AgeGate from "@/components/AgeGate";
import MobileMenu, { type HeaderLink } from "@/components/layout/MobileMenu";

const navLinks: HeaderLink[] = [
  { href: "/", label: "Início" },
  { href: "/lounge/mapa", label: "Mapa" },
  { href: "/studio", label: "Quero ser Premium", variant: "cta" },
];

const clinics = [
  {
    name: "Maison Aurora",
    city: "São Paulo - SP",
    image: "/studio-demo/maison-atmosfera-1.webp",
    rating: "4,9",
    tags: ["Alto padrão", "Ambiente reservado", "WhatsApp"],
  },
  {
    name: "Villa Veras",
    city: "Campinas - SP",
    image: "/studio-demo/maison-atmosfera-2.webp",
    rating: "4,8",
    tags: ["Ambiente premium", "Discrição total", "WhatsApp"],
  },
  {
    name: "Espaço Claris",
    city: "Ribeirão Preto - SP",
    image: "/studio-demo/maison-atmosfera-3.webp",
    rating: "4,9",
    tags: ["Alto padrão", "Ambiente reservado", "WhatsApp"],
  },
];

const cities = [
  ["São Paulo", "312 clínicas", "bridge"],
  ["Rio de Janeiro", "198 clínicas", "rio"],
  ["Belo Horizonte", "96 clínicas", "city"],
  ["Curitiba", "74 clínicas", "building"],
  ["Florianópolis", "58 clínicas", "bridge"],
  ["Porto Alegre", "61 clínicas", "city"],
];

const trustItems = [
  {
    icon: LockKeyhole,
    title: "Privacidade e discrição",
    text: "Ambientes selecionados que prezam pelo sigilo e respeito ao cliente.",
  },
  {
    icon: ShieldCheck,
    title: "Casas verificadas",
    text: "Avaliamos e verificamos cada espaço para garantir sua segurança.",
  },
  {
    icon: MessageCircle,
    title: "Contato facilitado",
    text: "Fale direto com as clínicas de forma rápida e prática pelo WhatsApp.",
  },
  {
    icon: Crown,
    title: "Experiência premium",
    text: "Ambientes de alto padrão para uma experiência exclusiva e confortável.",
  },
];

const steps = [
  ["Escolha a cidade", "Navegue pelo mapa ou selecione sua cidade de preferência."],
  ["Compare os espaços", "Veja informações, avaliações e diferenciais de cada clínica."],
  ["Entre em contato", "Fale diretamente via WhatsApp de forma rápida e segura."],
  ["Agende com discrição", "Agende seu atendimento com total privacidade e comodidade."],
];

export default function LoungeHomePage() {
  return (
    <main className="lounge-home-shell">
      <AgeGate />
      <LoungeHeader />

      <section className="lounge-home-hero">
        <div className="lounge-home-container lounge-home-hero-grid">
          <div className="lounge-home-copy">
            <p className="lounge-home-kicker">Bem-vindo ao PrivacyLog Lounge</p>
            <h1>
              Descubra espaços premium com <span>discrição e elegância.</span>
            </h1>
            <p>
              O PrivacyLog Lounge é o seu guia para encontrar clínicas e casas
              adultas selecionadas, com informações organizadas, ambientes
              verificados e contato facilitado.
            </p>
            <div className="lounge-home-actions">
              <Link href="/lounge/clinicas" className="lounge-home-primary">
                Explorar clínicas
                <ArrowRight size={18} />
              </Link>
              <Link href="/lounge/mapa" className="lounge-home-secondary">
                <MapPin size={18} />
                Ver mapa
              </Link>
            </div>
            <div className="lounge-home-age">
              <strong>18+</strong>
              <div>
                <b>Acesso restrito 18+</b>
                <span>Conteúdo adulto, exclusivo para maiores de 18 anos.</span>
              </div>
            </div>
          </div>

          <div className="lounge-home-visual" aria-hidden="true">
            <Image
              src="/lounge/lounge-hero.png"
              alt=""
              fill
              sizes="(max-width: 980px) 100vw, 56vw"
              className="lounge-home-hero-image"
              priority
            />
          </div>
        </div>
      </section>

      <section className="lounge-home-container lounge-search-bar" aria-label="Busca Lounge">
        <label>
          <Search size={20} />
          <input placeholder="Buscar por cidade, bairro ou nome da clínica" />
        </label>
        {["São Paulo", "Rio de Janeiro", "Com WhatsApp", "Premium", "Verificadas"].map((item) => (
          <Link key={item} href="/lounge/mapa">
            {item}
          </Link>
        ))}
      </section>

      <section className="lounge-home-container lounge-home-section">
        <div className="lounge-section-head">
          <p className="lounge-home-kicker">
            <Star size={14} fill="currentColor" />
            Clínicas em destaque
          </p>
          <Link href="/lounge/clinicas">
            Ver todas as clínicas
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="lounge-featured-grid">
          {clinics.map((clinic) => (
            <Link key={clinic.name} href="/lounge/mapa" className="lounge-clinic-card">
              <span className="lounge-card-media">
                <Image src={clinic.image} alt="" fill sizes="(max-width: 720px) 78vw, 360px" />
                <b>Premium</b>
              </span>
              <span className="lounge-card-body">
                <strong>{clinic.name}</strong>
                <small>{clinic.city}</small>
                <em>
                  <Star size={13} fill="currentColor" />
                  {clinic.rating}
                </em>
                <span>
                  {clinic.tags.map((tag) => (
                    <i key={tag}>{tag}</i>
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="lounge-home-container lounge-home-section">
        <p className="lounge-home-kicker">
          <MapPin size={14} />
          Explore por localização
        </p>
        <div className="lounge-location-grid">
          <div className="lounge-mini-map">
            <Image
              src="/lounge/lounge-location-map.png"
              alt="Mapa de localização PrivacyLog Lounge"
              fill
              sizes="(max-width: 980px) 100vw, 48vw"
            />
          </div>
          <div className="lounge-city-grid">
            {cities.map(([city, count, icon]) => (
              <Link key={city} href="/lounge/mapa" className="lounge-city-card">
                <CityIcon type={icon} />
                <span>
                  <strong>{city}</strong>
                  <small>{count}</small>
                  <em>
                    Ver na cidade
                    <ArrowRight size={14} />
                  </em>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="lounge-home-container lounge-trust-grid">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title}>
              <Icon size={38} />
              <div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="lounge-home-container lounge-home-section">
        <p className="lounge-home-kicker">
          <Sparkles size={14} fill="currentColor" />
          Como funciona
        </p>
        <div className="lounge-step-grid">
          {steps.map(([title, text], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <MapPin size={34} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <LoungeFooter />
    </main>
  );
}

function LoungeHeader() {
  return (
    <header className="lounge-home-header">
      <div className="lounge-home-container lounge-home-header-inner">
        <Link href="/lounge" className="lounge-home-brand">
          <Image src="/brand/logo-lounge.png" alt="" width={48} height={48} priority />
          <span>
            Privacy <span>Log</span> <strong>Lounge</strong>
          </span>
        </Link>
        <nav className="lounge-home-nav desktop-product-nav" aria-label="Navegação Lounge">
          <Link href="/">Início</Link>
          <Link href="/lounge/mapa">Mapa</Link>
        </nav>
        <div className="lounge-home-actions-nav desktop-product-nav">
          <Link href="/studio" className="lounge-home-premium">
            <Crown size={16} />
            Quero ser Premium
          </Link>
        </div>
        <MobileMenu links={navLinks} />
      </div>
    </header>
  );
}

function LoungeFooter() {
  return (
    <footer className="lounge-home-footer">
      <div className="lounge-home-container lounge-footer-grid">
        <div>
          <div className="lounge-home-brand">
            <Image src="/brand/logo-lounge.png" alt="" width={46} height={46} />
            <span>
              Privacy <span>Log</span> <strong>Lounge</strong>
            </span>
          </div>
          <p>
            Seu guia premium para clínicas e casas adultas selecionadas.
            Discrição, organização e informação de qualidade para uma
            experiência segura.
          </p>
        </div>
        <nav>
          <strong>Navegação</strong>
          <Link href="/">Início</Link>
          <Link href="/lounge">Lounge</Link>
          <Link href="/forum">Fórum</Link>
          <Link href="/lounge/mapa">Mapa</Link>
          <Link href="/lounge/categorias">Cidades</Link>
        </nav>
        <nav>
          <strong>Links úteis</strong>
          <Link href="/lounge/mapa">Como funciona</Link>
          <Link href="/lounge/mapa">Dúvidas frequentes</Link>
          <Link href="/club/termos">Termos de uso</Link>
          <Link href="/club/privacidade">Política de privacidade</Link>
        </nav>
        <nav>
          <strong>Contato</strong>
          <span>
            <Mail size={15} />
            contato@privacylog.com.br
          </span>
          <span>
            <Phone size={15} />
            +55 (11) 99999-9999
          </span>
          <span>
            <MapPin size={15} />
            São Paulo - SP
          </span>
        </nav>
      </div>
      <small>© 2026 PrivacyLog Lounge. Todos os direitos reservados.</small>
    </footer>
  );
}

function CityIcon({ type }: { type: string }) {
  if (type === "rio") return <UserRoundCheck size={40} />;
  if (type === "building") return <Crown size={40} />;
  if (type === "city") return <ShieldCheck size={40} />;
  return <MapPin size={40} />;
}
