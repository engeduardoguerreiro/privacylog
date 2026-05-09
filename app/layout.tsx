import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "PrivacyLog",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://privacylog.com.br"
  ),
  title: {
    default: "PrivacyLog",
    template: "%s | PrivacyLog",
  },
  description:
    "Mapa e fórum nacional para encontrar clínicas, casas de massagem, privês e boates com filtros, destaques premium e comunidade.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "PrivacyLog",
    description:
      "Mapa e fórum nacional com locais, filtros, destaques premium e comunidade.",
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
    title: "PrivacyLog",
    description:
      "Mapa e fórum nacional com locais, filtros, destaques premium e comunidade.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
