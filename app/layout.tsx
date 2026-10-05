import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import CookieBanner from "@/components/shared/CookieBanner";
import PWARegister from "@/components/shared/PWARegister";
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
    default: "Massagem sensual, tântrica e relaxante | PrivacyLog",
    template: "%s | PrivacyLog",
  },
  description:
    "Massagem sensual, tântrica e relaxante nas melhores casas e privês: massagistas verificadas, fotos reais e disponibilidade do dia. Chame no WhatsApp com discrição.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "PrivacyLog",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Massagem sensual, tântrica e relaxante | PrivacyLog",
    description:
      "Massagem sensual, tântrica e relaxante nas melhores casas e privês: massagistas verificadas, fotos reais e disponibilidade do dia. Chame no WhatsApp com discrição.",
    images: [
      {
        url: "/brand/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "PrivacyLog",
      },
    ],
    locale: "pt_BR",
    siteName: "PrivacyLog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Massagem sensual, tântrica e relaxante | PrivacyLog",
    description:
      "Massagem sensual, tântrica e relaxante nas melhores casas e privês: massagistas verificadas, fotos reais e disponibilidade do dia. Chame no WhatsApp com discrição.",
    images: ["/brand/og-default.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#17130f",
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
        <PWARegister />
      </body>
    </html>
  );
}
