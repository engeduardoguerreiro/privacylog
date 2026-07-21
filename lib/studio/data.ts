import type {
  StudioClinic,
  StudioPlan,
  StudioPlanSlug,
  StudioProfessional,
  StudioProfessionalStatus,
} from "./types";

const logo = "/brand/logo-studio.png";
const maisonDemoHero = "/studio-demo/maison-hero-reference.png";
const maisonDemoPhotos = [
  "/studio-demo/maison-atmosfera-1.webp",
  "/studio-demo/maison-atmosfera-2.webp",
  "/studio-demo/maison-atmosfera-3.webp",
  "/studio-demo/maison-atmosfera-4.webp",
];
const maisonDemoModels = [
  "/studio-demo/maison-modelo-1.webp",
  "/studio-demo/maison-modelo-2.webp",
  "/studio-demo/maison-modelo-3.webp",
  "/studio-demo/maison-modelo-4.webp",
];

export const studioPlans: StudioPlan[] = [
  {
    slug: "essential",
    name: "Essencial",
    price: "R$ 97/mes",
    audience:
      "Para casas que querem uma pagina premium, discreta e pronta para converter sem depender de divulgacao dentro do ecossistema.",
    highlight: "Vitrine propria",
    digitalAddress: {
      title: "Endereco da casa",
      value: "seudominio.com.br ou nome.privacylog.com.br",
      note: "Se a casa ja tiver dominio, utilizamos o dominio existente. Se nao tiver, entregamos em subdominio PrivacyLog.",
    },
    features: [
      "Pagina publica premium para sua clinica",
      "Identidade visual PrivacyLog Studio",
      "Galeria da casa, horarios e endereco",
      "Cadastro de profissionais/modelos",
      "Disponibilidade do dia",
      "Botao de reserva direto no WhatsApp",
      "Painel simples para atualizar a vitrine",
      "Sem divulgacao no Lounge e no Forum",
      "Suporte essencial para manter tudo no ar",
    ],
  },
  {
    slug: "black",
    name: "Black",
    price: "R$ 397/mes",
    audience:
      "Para marcas que querem presenca forte, divulgacao dentro do PrivacyLog e suporte premium para vender com mais autoridade.",
    highlight: "Mais completo",
    digitalAddress: {
      title: "Dominio proprio",
      value: "seudominio.com.br",
      note: "Se a casa nao tiver dominio, o plano Black inclui dominio proprio. Se ja tiver, utilizamos o dominio atual.",
    },
    features: [
      "Tudo do Essencial",
      "Divulgacao no PrivacyLog Lounge",
      "Divulgacao no PrivacyLog Forum",
      "Destaques comerciais dentro do ecossistema",
      "Dominio proprio incluso caso a casa nao tenha",
      "Suporte 24 horas",
      "Prioridade em ajustes e orientacao comercial",
      "Mais presenca para cidade, bairro e marca",
      "Vitrine com percepcao de luxo mais forte",
    ],
  },
];

export const studioExtras = [
  "Landing page premium com visual PrivacyLog Studio",
  "Painel simples para cadastrar profissionais e atualizar disponibilidade",
  "Botao de WhatsApp como conversao principal",
  "Galeria da casa, horarios e endereco organizados",
  "Estrutura preparada para dominio proprio ou subdominio",
];

export const studioTemplates = [
  {
    name: "Luxo Escuro",
    tone: "Preto profundo, ouro e fotos que prendem o olhar",
    accent: "#d4af37",
  },
  {
    name: "Bordo Premium",
    tone: "Vinho, sombras quentes e clima de tentacao discreta",
    accent: "#8a1c2e",
  },
  {
    name: "Gold Lounge",
    tone: "Dourado metlico com presenca de clube privado",
    accent: "#f5d67b",
  },
  {
    name: "Minimal VIP",
    tone: "Poucos elementos, muito luxo e foco na reserva",
    accent: "#a1a1aa",
  },
  {
    name: "Spa Sensual",
    tone: "Luxo reservado, bem-estar e desejo sem excesso",
    accent: "#5b0f1b",
  },
];

const professionals: StudioProfessional[] = [
  {
    id: 1,
    clinicId: 1,
    stageName: "Luna",
    slug: "luna",
    age: 25,
    shortDescription: "Presenca elegante, atendimento reservado e agenda flex?vel.",
    bio: "Perfil criado para apresentar a experiencia com desejo, discricao e alto valor percebido.",
    mainPhotoUrl: maisonDemoModels[0],
    photos: [maisonDemoModels[0]],
    status: "available_now",
    availabilityWindow: "14:00 as 22:00",
    isActive: true,
    isAvailableToday: true,
    isFeatured: true,
    tags: ["Relaxante", "VIP", "Agenda hoje"],
    services: ["Massagem relaxante", "Atendimento reservado"],
  },
  {
    id: 2,
    clinicId: 1,
    stageName: "Maya",
    slug: "maya",
    age: 28,
    shortDescription: "Perfil premium para quem busca uma experiencia mais exclusiva hoje.",
    bio: "Apresentacao comercial pensada para valorizar a profissional e acelerar a reserva.",
    mainPhotoUrl: maisonDemoModels[1],
    photos: [maisonDemoModels[1]],
    status: "available_today",
    availabilityWindow: "18:00 as 23:00",
    isActive: true,
    isAvailableToday: true,
    isFeatured: false,
    tags: ["Premium", "Hoje", "Reservas"],
    services: ["Massagem premium", "Experiencia personalizada"],
  },
  {
    id: 5,
    clinicId: 1,
    stageName: "Larissa M.",
    slug: "larissa-m",
    age: 27,
    shortDescription: "Laser e tecnologia com atendimento sofisticado.",
    bio: "Perfil demonstrativo para compor a vitrine da Maison Aurora.",
    mainPhotoUrl: maisonDemoModels[2],
    photos: [maisonDemoModels[2]],
    status: "available_today",
    availabilityWindow: "Sob consulta",
    isActive: true,
    isAvailableToday: true,
    isFeatured: false,
    tags: ["Tecnologia", "Hoje"],
    services: ["Estetica premium"],
  },
  {
    id: 6,
    clinicId: 1,
    stageName: "Juliana P.",
    slug: "juliana-p",
    age: 29,
    shortDescription: "Corpo e contorno em uma experiência premium.",
    bio: "Perfil demonstrativo para compor a vitrine da Maison Aurora.",
    mainPhotoUrl: maisonDemoModels[3],
    photos: [maisonDemoModels[3]],
    status: "available_today",
    availabilityWindow: "Sob consulta",
    isActive: true,
    isAvailableToday: true,
    isFeatured: false,
    tags: ["Premium", "Reservas"],
    services: ["Bem-estar"],
  },
  {
    id: 3,
    clinicId: 2,
    stageName: "Sofia",
    slug: "sofia",
    age: 26,
    shortDescription: "Agenda especial para clientes que preferem atendimento reservado.",
    bio: "Perfil de exemplo com tom sofisticado para destacar disponibilidade e estilo.",
    mainPhotoUrl: maisonDemoModels[2],
    photos: [maisonDemoModels[2]],
    status: "available_today",
    availabilityWindow: "12:00 as 20:00",
    isActive: true,
    isAvailableToday: true,
    isFeatured: true,
    tags: ["Spa", "Relax", "Discreta"],
    services: ["Massagem relaxante", "Atendimento agendado"],
  },
  {
    id: 4,
    clinicId: 3,
    stageName: "Bianca",
    slug: "bianca",
    age: 29,
    shortDescription: "Agenda disputada, com novas janelas em breve.",
    bio: "Perfil usado para mostrar como uma agenda cheia tambem reforca desejo.",
    mainPhotoUrl: logo,
    photos: [logo],
    status: "booked",
    availabilityWindow: "Agenda cheia",
    isActive: true,
    isAvailableToday: false,
    isFeatured: false,
    tags: ["Agenda cheia", "VIP"],
    services: ["Atendimento reservado"],
  },
];

export const studioClinics: StudioClinic[] = [
  {
    id: 1,
    name: "Maison Aurora",
    slug: "maison-aurora",
    description:
      "Uma casa de atmosfera reservada, criada para quem procura uma experiencia elegante antes mesmo da reserva. A vitrine combina ambiente, equipe do dia e contato direto em uma apresentacao de alto padrao.",
    shortDescription:
      "Endereco Black com clima privado, equipe em destaque e reserva direta.",
    businessType: "clinica",
    city: "Sao Paulo",
    state: "SP",
    neighborhood: "Jardins",
    address: "Endereco reservado - Jardins, Sao Paulo",
    latitude: -23.5617,
    longitude: -46.6559,
    whatsapp: "5511999999999",
    phone: "11 99999-9999",
    instagram: "@maisonaurora.demo",
    website: "https://www.maisonaurora.com.br",
    studioPath: "studio.privacylog.com.br/maison-aurora",
    clinicSubdomain: "maison-aurora.privacylog.com.br",
    customDomain: "www.maisonaurora.com.br",
    customDomainIncludedUntil: "2027-05-12",
    domainRenewalNote:
      "Dominio incluso no primeiro ano. Renovacao cobrada conforme o valor do registrador.",
    logoUrl: logo,
    mainImageUrl: maisonDemoHero,
    status: "approved",
    plan: "black",
    isPartner: true,
    isFeatured: true,
    isVerified: true,
    openingHours: buildDefaultHours("11:00 as 23:00", "12:00 as 20:00"),
    paymentMethods: ["PIX", "Cartao", "Dinheiro"],
    services: ["Massagens", "Lounges privativos", "Reservas"],
    rules:
      "Atendimento somente para maiores de 18 anos, mediante reserva e regras internas da casa.",
    photos: maisonDemoPhotos,
    professionals: professionals.filter((item) => item.clinicId === 1),
  },
  {
    id: 2,
    name: "Villa Rubi",
    slug: "villa-rubi",
    description:
      "Um lounge parceiro com visual sofisticado, comunicacao discreta e uma experiencia pensada para despertar curiosidade, confianca e vontade de reservar.",
    shortDescription:
      "Vitrine premium com agenda do dia, fotos marcantes e contato reservado.",
    businessType: "lounge",
    city: "Belo Horizonte",
    state: "MG",
    neighborhood: "Savassi",
    address: "Endereco reservado - Savassi, Belo Horizonte",
    whatsapp: "5531999999999",
    studioPath: "studio.privacylog.com.br/villa-rubi",
    clinicSubdomain: "villa-rubi.privacylog.com.br",
    logoUrl: logo,
    mainImageUrl: logo,
    status: "approved",
    plan: "premium",
    isPartner: true,
    isFeatured: true,
    isVerified: true,
    openingHours: buildDefaultHours("10:00 as 22:00", "11:00 as 19:00"),
    paymentMethods: ["PIX", "Cartao"],
    services: ["Spa", "Massagens", "Reservas"],
    rules: "Reservas feitas diretamente com a recepcao.",
    photos: [logo, logo, logo],
    professionals: professionals.filter((item) => item.clinicId === 2),
  },
  {
    id: 3,
    name: "Spa Velvet Rio",
    slug: "spa-velvet-rio",
    description:
      "Uma presenca discreta e charmosa para apresentar ambiente, horarios e contato com mais valor percebido.",
    shortDescription: "Pagina elegante para transformar pesquisa em reserva.",
    businessType: "spa",
    city: "Rio de Janeiro",
    state: "RJ",
    neighborhood: "Copacabana",
    address: "Endereco reservado - Copacabana, Rio de Janeiro",
    whatsapp: "5521999999999",
    studioPath: "studio.privacylog.com.br/spa-velvet-rio",
    logoUrl: logo,
    mainImageUrl: logo,
    status: "approved",
    plan: "essential",
    isPartner: true,
    isFeatured: false,
    isVerified: false,
    openingHours: buildDefaultHours("12:00 as 22:00", "Fechado", true),
    paymentMethods: ["PIX"],
    services: ["Massagens", "Atendimento agendado"],
    rules: "Ambiente reservado e atendimento com hora marcada.",
    photos: [logo, logo],
    professionals: professionals.filter((item) => item.clinicId === 3),
  },
];

export function getStudioClinicBySlug(slug: string) {
  return studioClinics.find((clinic) => clinic.slug === slug);
}

export function getStudioClinicPublicPath(clinic: StudioClinic) {
  return `/studio/clinicas/${clinic.slug}`;
}

export function getStudioClinicPrimaryUrl(clinic: StudioClinic) {
  if (clinic.plan === "black" && clinic.customDomain) {
    return `https://${clinic.customDomain}`;
  }

  if (clinic.plan === "premium" && clinic.clinicSubdomain) {
    return `https://${clinic.clinicSubdomain}`;
  }

  return `https://${clinic.studioPath}`;
}

export function getPlanLabel(plan: StudioPlanSlug) {
  const labels: Record<StudioPlanSlug, string> = {
    essential: "Essencial",
    premium: "Premium",
    black: "Black",
  };

  return labels[plan];
}

export function getProfessionalStatusLabel(status: StudioProfessionalStatus) {
  const labels: Record<StudioProfessionalStatus, string> = {
    available_now: "Disponivel agora",
    available_today: "Disponivel hoje",
    booked: "Agenda cheia",
    unavailable: "Indisponivel",
  };

  return labels[status];
}

export function getAvailableProfessionals(clinic: StudioClinic) {
  return clinic.professionals.filter((professional) =>
    ["available_now", "available_today"].includes(professional.status)
  );
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalized = number.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function buildDefaultHours(
  weekday: string,
  weekend: string,
  sundayClosed = false
) {
  return [
    { day: "Segunda", hours: weekday },
    { day: "Terca", hours: weekday },
    { day: "Quarta", hours: weekday },
    { day: "Quinta", hours: weekday },
    { day: "Sexta", hours: weekday },
    { day: "Sabado", hours: weekend, closed: weekend === "Fechado" },
    { day: "Domingo", hours: sundayClosed ? "Fechado" : weekend, closed: sundayClosed },
  ];
}
