import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://*.vercel-insights.com",
  "frame-src 'self' https://www.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // O Lounge deixou de ser um produto separado: mapa e locais vivem na raiz.
  // Redireciona permanente os enderecos antigos (links e indexacao do Google).
  async redirects() {
    return [
      { source: "/lounge", destination: "/clinicas", permanent: true },
      { source: "/lounge/mapa", destination: "/mapa", permanent: true },
      { source: "/lounge/clinicas", destination: "/clinicas", permanent: true },
      { source: "/lounge/clinicas/:id", destination: "/clinicas/:id", permanent: true },
      { source: "/lounge/cidade/:slug", destination: "/clinicas/cidade/:slug", permanent: true },
      { source: "/lounge/categorias", destination: "/clinicas", permanent: true },
      { source: "/lounge/planos", destination: "/studio/planos", permanent: true },
      { source: "/lounge/anunciar", destination: "/studio", permanent: true },
      { source: "/lounge/:path*", destination: "/clinicas", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(self), geolocation=(self), payment=(), usb=(), browsing-topics=()",
          },
        ],
      },
      {
        // Service worker do PWA: sempre a versao mais nova, escopo raiz.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
