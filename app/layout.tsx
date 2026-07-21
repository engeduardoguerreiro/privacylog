import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Inter } from "next/font/google";
import CookieBanner from "@/components/shared/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "PrivacyLog",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://privacylog.com.br"
  ),
  title: {
    default: "PrivacyLog | Ecossistema Premium Adulto",
    template: "%s | PrivacyLog",
  },
  description:
    "O ecossistema PrivacyLog reúne comunidade, mapa, anúncios e soluções digitais para o mercado adulto premium.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "PrivacyLog | Ecossistema Premium Adulto",
    description:
      "O ecossistema PrivacyLog reúne comunidade, mapa, anúncios e soluções digitais para o mercado adulto premium.",
    images: [
      {
        url: "/logo.jpg",
        width: 1536,
        height: 1495,
        alt: "PrivacyLog",
      },
    ],
    locale: "pt_BR",
    siteName: "PrivacyLog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivacyLog | Ecossistema Premium Adulto",
    description:
      "O ecossistema PrivacyLog reúne comunidade, mapa, anúncios e soluções digitais para o mercado adulto premium.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
