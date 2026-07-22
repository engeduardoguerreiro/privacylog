import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
    default: "PrivacyLog | Casas de massagem, clínicas e privês",
    template: "%s | PrivacyLog",
  },
  description:
    "O guia premium de casas de massagem, clínicas e privês com página própria, modelos verificadas e presença no mapa.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "PrivacyLog | Casas de massagem, clínicas e privês",
    description:
      "O guia premium de casas de massagem, clínicas e privês com página própria, modelos verificadas e presença no mapa.",
    images: [
      {
        url: "/brand/privacylog.png",
        width: 1254,
        height: 1254,
        alt: "PrivacyLog",
      },
    ],
    locale: "pt_BR",
    siteName: "PrivacyLog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivacyLog | Casas de massagem, clínicas e privês",
    description:
      "O guia premium de casas de massagem, clínicas e privês com página própria, modelos verificadas e presença no mapa.",
    images: ["/brand/privacylog.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
