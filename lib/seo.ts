import type { Metadata } from "next";
import { getMainSiteUrl, getProductBaseUrl, type Product } from "./subdomain";

const productSeo: Record<
  Product,
  { title: string; description: string; image: string }
> = {
  main: {
    title: "Massagem sensual, tântrica e relaxante | PrivacyLog",
    description:
      "Massagem sensual, tântrica e relaxante nas melhores casas e privês: massagistas verificadas, fotos reais e disponibilidade do dia. Chame no WhatsApp com discrição.",
    image: "/brand/og-default.jpg",
  },
  lounge: {
    title: "Mapa de massagem sensual e casas de massagem | PrivacyLog",
    description:
      "Encontre no mapa casas de massagem sensual, tântrica e relaxante, clínicas e privês perto de você, com endereço, rota e contato reservado.",
    image: "/brand/og-default.jpg",
  },
  studio: {
    title: "PrivacyLog Studio | Sites Premium para Clinicas e Prives",
    description:
      "Criação de sites premium, presença digital e automação comercial para clínicas de massagem, privês e estabelecimentos adultos.",
    image: "/brand/og-default.jpg",
  },
};

/**
 * Titulo que ja traz a marca nao passa pelo template "%s | PrivacyLog" do
 * layout raiz (evita "... | PrivacyLog Studio | PrivacyLog").
 */
function resolveTitle(title: string): Metadata["title"] {
  return title.includes("PrivacyLog") ? { absolute: title } : title;
}

/**
 * Metadata do layout de cada produto. Nao define canonical nem og:url: o
 * layout e herdado por todas as paginas filhas, e um canonical aqui fazia
 * /lounge/cidade/sao-paulo (e as demais) se declararem copia de /lounge.
 * Cada pagina define o proprio via pageMetadata({ path }).
 */
export function productMetadata(product: Product): Metadata {
  const seo = productSeo[product];

  return {
    // So a origem: com caminho (/lounge), imagens relativas viravam
    // /lounge/brand/... e davam 404.
    metadataBase: new URL(getMainSiteUrl()),
    title: resolveTitle(seo.title),
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      siteName: "PrivacyLog",
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: seo.image,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.image],
    },
  };
}

export function pageMetadata({
  title,
  description,
  product = "main",
  path = "",
  image,
}: {
  title: string;
  description: string;
  product?: Product;
  path?: string;
  image?: string;
}): Metadata {
  const baseUrl = getProductBaseUrl(product);
  const url = `${baseUrl}${path}`;
  // openGraph da pagina substitui o do layout inteiro: sem imagem propria,
  // usa a do produto para o link nao ficar sem preview.
  const shareImage = image || productSeo[product].image;

  return {
    title: resolveTitle(title),
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "PrivacyLog",
      locale: "pt_BR",
      type: "website",
      images: [
        image
          ? { url: image, alt: title }
          : { url: shareImage, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
  };
}
