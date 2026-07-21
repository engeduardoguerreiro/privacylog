import type { Metadata } from "next";
import { getProductBaseUrl, type Product } from "./subdomain";

const productSeo: Record<
  Product,
  { title: string; description: string; image: string }
> = {
  main: {
    title: "PrivacyLog | Ecossistema Premium Adulto",
    description:
      "O ecossistema PrivacyLog reúne comunidade, mapa, anúncios e soluções digitais para o mercado adulto premium.",
    image: "/logo.jpg",
  },
  lounge: {
    title: "PrivacyLog Lounge | Mapa Premium de Clínicas e Casas Adultas",
    description:
      "Encontre clínicas, casas, lounges, massagens e estabelecimentos adultos no mapa premium PrivacyLog Lounge.",
    image: "/brand/logo-lounge.png",
  },
  studio: {
    title: "PrivacyLog Studio | Sites Premium para Clinicas e Prives",
    description:
      "Criação de sites premium, presença digital e automação comercial para clínicas de massagem, privês e estabelecimentos adultos.",
    image: "/brand/logo-studio.png",
  },
};

export function productMetadata(product: Product): Metadata {
  const seo = productSeo[product];
  const baseUrl = getProductBaseUrl(product);

  return {
    metadataBase: new URL(baseUrl),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: baseUrl,
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

  return {
    title,
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
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
