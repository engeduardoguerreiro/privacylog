import type { User } from "@supabase/supabase-js";

const defaultAdminEmails = ["contato@privacylog.com.br"];

export function getAdminEmails() {
  const configuredEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

  return Array.from(
    new Set([...defaultAdminEmails.map(normalizeEmail), ...configuredEmails])
  );
}

export function isAdminEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email || "");

  if (!normalizedEmail) {
    return false;
  }

  return getAdminEmails().includes(normalizedEmail);
}

export function isAdminUser(user: Pick<User, "email"> | null | undefined) {
  return isAdminEmail(user?.email);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
