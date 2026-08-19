import { NextResponse } from "next/server";

/**
 * Digital Asset Links — vincula o app Android (TWA) a este dominio.
 * Sem isto o app abre com a barra de endereco do navegador aparecendo.
 *
 * A impressao digital SHA-256 e informacao PUBLICA (nao e segredo): ela apenas
 * declara qual chave assinou o APK oficial. A chave e a senha ficam com o dono.
 *
 * Pode ser definida por variavel de ambiente (uma ou varias, separadas por
 * virgula) ou pela constante abaixo.
 */
const PACKAGE_NAME = "br.com.privacylog.app";

// Preenchida quando a chave de assinatura for criada (ver docs/APK_ANDROID.md).
const FALLBACK_FINGERPRINTS: string[] = [
  "CC:D8:38:42:37:97:6E:19:93:C9:74:21:9A:DB:C0:93:CD:26:61:C1:86:C1:01:F4:D0:AF:5B:A9:29:BE:2E:9C",
];

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const fromEnv = (process.env.ANDROID_CERT_FINGERPRINTS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const fingerprints = fromEnv.length ? fromEnv : FALLBACK_FINGERPRINTS;

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
