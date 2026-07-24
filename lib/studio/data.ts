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
    price: "R$ 59,90/mês",
    audience:
      "Para a casa que quer uma página premium, discreta e pronta para converter no WhatsApp, com identidade própria.",
    highlight: "Vitrine própria",
    digitalAddress: {
      title: "Endereço da casa",
      value: "seudomínio.com.br ou nome.privacylog.com.br",
      note: "Se a casa já tiver domínio, usamos o domínio existente. Se não tiver, entregamos em subdomínio PrivacyLog.",
    },
    features: [
      "Página pública premium para a sua casa",
      "5 temas de cores + logotipo próprio",
      "Galeria da casa, horários e endereço",
      "Cadastro de modelos e disponibilidade do dia",
      "Botão de WhatsApp flutuante para reserva",
      "Painel próprio para atualizar tudo sozinha",
      "Endereço em subdomínio PrivacyLog ou domínio próprio",
      "Suporte essencial para manter tudo no ar",
    ],
  },
  {
    slug: "black",
    name: "Black",
    price: "R$ 129,90/mês",
    audience:
      "Para a casa que quer presença forte no PrivacyLog: destaque na home, no mapa e suporte prioritário.",
    highlight: "Mais completo",
    digitalAddress: {
      title: "Domínio próprio",
      value: "seudomínio.com.br",
      note: "Se a casa não tiver domínio, o plano Black inclui domínio próprio. Se já tiver, usamos o domínio atual.",
    },
    features: [
      "Tudo do Essencial",
      "Presença no mapa do PrivacyLog",
      "Destaque na home e na vitrine de casas parceiras",
      "Selo de casa verificada",
      "Domínio próprio incluso caso a casa não tenha",
      "Suporte prioritário",
      "Mais alcance para cidade, bairro e marca",
    ],
  },
];

export const studioExtras = [
  "Landing page premium com visual PrivacyLog",
  "Painel simples para cadastrar profissionais e atualizar disponibilidade",
  "Botão de WhatsApp como conversao principal",
  "Galeria da casa, horários e endereço organizados",
  "Estrutura preparada para domínio próprio ou subdomínio",
];

export const studioTemplates = [
  {
    name: "Luxo Escuro",
    tone: "Preto profundo, ouro e fotos que prendem o olhar",
    accent: "#d4af37",
  },
  {
    name: "Bordo Premium",
    tone: "Vinho, sombras quentes e clima de tentação discreta",
    accent: "#8a1c2e",
  },
  {
    name: "Gold Lounge",
    tone: "Dourado metálico com presença de clube privado",
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
    shortDescription: "Presença elegante, atendimento reservado e agenda flexível.",
    bio: "Perfil criado para apresentar a experiência com desejo, discrição e alto valor percebido.",
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
    shortDescription: "Perfil premium para quem busca uma experiência mais exclusiva hoje.",
    bio: "Apresentação comercial pensada para valorizar a profissional e acelerar a reserva.",
    mainPhotoUrl: maisonDemoModels[1],
    photos: [maisonDemoModels[1]],
    status: "available_today",
    availabilityWindow: "18:00 as 23:00",
    isActive: true,
    isAvailableToday: true,
    isFeatured: false,
    tags: ["Premium", "Hoje", "Reservas"],
    services: ["Massagem premium", "Experiência personalizada"],
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
    services: ["Estética premium"],
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
    bio: "Perfil usado para mostrar como uma agenda cheia também reforça desejo.",
    mainPhotoUrl: "/clinicas/18_01.webp",
    photos: ["/clinicas/18_01.webp"],
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
      "Uma casa de atmosfera reservada, criada para quem procura uma experiência elegante antes mesmo da reserva. A vitrine combina ambiente, equipe do dia e contato direto em uma apresentação de alto padrao.",
    shortDescription:
      "Endereço Black com clima privado, equipe em destaque e reserva direta.",
    businessType: "clinica",
    city: "São Paulo",
    state: "SP",
    neighborhood: "Jardins",
    address: "Endereço reservado - Jardins, São Paulo",
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
      "Domínio incluso no primeiro ano. Renovacao cobrada conforme o valor do registrador.",
    logoUrl: logo,
    theme: "champagne",
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
      "Um lounge parceiro com visual sofisticado, comunicacao discreta e uma experiência pensada para despertar curiosidade, confianca e vontade de reservar.",
    shortDescription:
      "Vitrine premium com agenda do dia, fotos marcantes e contato reservado.",
    businessType: "lounge",
    city: "Belo Horizonte",
    state: "MG",
    neighborhood: "Savassi",
    address: "Endereço reservado - Savassi, Belo Horizonte",
    whatsapp: "5531999999999",
    studioPath: "studio.privacylog.com.br/villa-rubi",
    clinicSubdomain: "villa-rubi.privacylog.com.br",
    logoUrl: logo,
    theme: "champagne",
    mainImageUrl: "/clinicas/16_01.webp",
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
      "Uma presença discreta e charmosa para apresentar ambiente, horários e contato com mais valor percebido.",
    shortDescription: "Página elegante para transformar pesquisa em reserva.",
    businessType: "spa",
    city: "Rio de Janeiro",
    state: "RJ",
    neighborhood: "Copacabana",
    address: "Endereço reservado - Copacabana, Rio de Janeiro",
    whatsapp: "5521999999999",
    studioPath: "studio.privacylog.com.br/spa-velvet-rio",
    logoUrl: logo,
    theme: "champagne",
    mainImageUrl: "/clinicas/17_01.webp",
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
