import type { User } from "@supabase/supabase-js";

const defaultAdminEmails = ["contato@privacylog.com.br"];
const adminRoles = new Set(["admin", "owner"]);

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

export function isAdminUser(
  user: (Pick<User, "email"> & Partial<Pick<User, "app_metadata">>) | null | undefined
) {
  const appMetadata = user?.app_metadata as Record<string, unknown> | undefined;
  const role = appMetadata?.role;
  const roles = Array.isArray(appMetadata?.roles) ? appMetadata.roles : [];

  return (
    (typeof role === "string" && adminRoles.has(role)) ||
    roles.some((item) => typeof item === "string" && adminRoles.has(item)) ||
    isAdminEmail(user?.email)
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
