import { timingSafeEqual } from "node:crypto";

/**
 * Autoriza chamadas dos crons da Vercel, que mandam
 * "Authorization: Bearer <CRON_SECRET>".
 *
 * Falha fechado: sem CRON_SECRET configurado, so libera fora de producao
 * (dev local). Em producao a rota responde 401 ate o segredo existir.
 */
export function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const header = request.headers.get("authorization") || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);

  return expected.length === received.length && timingSafeEqual(expected, received);
}
