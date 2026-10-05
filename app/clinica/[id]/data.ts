// Tipos e helpers do local, usados no servidor e no client

export type Clinic = {
  id: number;
  nome: string;
  descricao?: string | null;
  contato?: string | null;
  site?: string | null;
  forum?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  lat: number | string | null;
  lng?: number | string | null;
  tipo?: string | null;
  plano?: string | null;
  imagens?: unknown;
  preco_30_normal?: number | null;
  preco_30_forista?: number | null;
  preco_60_normal?: number | null;
  preco_60_forista?: number | null;
};

export const fallbackClinicImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945";

function parseImages(imagens: unknown) {
  if (Array.isArray(imagens)) {
    return imagens.filter(
      (image): image is string => typeof image === "string" && image.length > 0
    );
  }

  if (typeof imagens === "string" && imagens.trim()) {
    try {
      const parsed = JSON.parse(imagens);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (image): image is string =>
            typeof image === "string" && image.length > 0
        );
      }
    } catch {
      return [imagens];
    }
  }

  return [];
}

export function getClinicImages(clinic: Clinic) {
  const storedImages = parseImages(clinic.imagens);

  if (storedImages.length > 0) {
    return storedImages.slice(0, 3);
  }

  return [
    `/clinicas/${clinic.id}_01.webp`,
    `/clinicas/${clinic.id}_02.webp`,
    `/clinicas/${clinic.id}_03.webp`,
  ];
}

// Texto que o robo de importacao grava enquanto o cadastro nao e revisado.
// Fala do forum (que nao existe mais) e nao diz nada do local: nao exibe.
const importPlaceholderPrefix = "Informações cadastrais em validação";

/** Descricao para exibir e para o Google: a do cadastro ou uma gerada. */
export function getClinicDescription(clinic: Clinic) {
  const own = clinic.descricao?.trim();

  if (own && !own.startsWith(importPlaceholderPrefix)) {
    return own;
  }

  const place = [clinic.bairro, clinic.cidade].filter(Boolean).join(", ");

  return `${clinic.nome}: massagem sensual e relaxante${
    place ? ` em ${place}` : ""
  }. Veja endereço, fotos, valores e chame direto pelo WhatsApp, com toda a discrição.`;
}
