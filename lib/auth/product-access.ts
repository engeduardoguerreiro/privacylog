import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminUser } from "./admin";

export const authProducts = ["lounge", "studio"] as const;

export type AuthProduct = (typeof authProducts)[number];

const productTables: Record<AuthProduct, string> = {
  lounge: "lounge_profiles",
  studio: "studio_profiles",
};

const productLabels: Record<AuthProduct, string> = {
  lounge: "PrivacyLog Lounge",
  studio: "PrivacyLog Studio",
};

export function normalizeAuthProduct(
  value: FormDataEntryValue | string | null | undefined,
  fallback: AuthProduct = "studio"
): AuthProduct {
  const product = typeof value === "string" ? value.trim().toLowerCase() : "";

  return authProducts.includes(product as AuthProduct)
    ? (product as AuthProduct)
    : fallback;
}

export function getAuthProductFromPath(path: string): AuthProduct {
  if (path === "/lounge" || path.startsWith("/lounge/")) {
    return "lounge";
  }

  return "studio";
}

export function getProductLabel(product: AuthProduct) {
  return productLabels[product];
}

export function getProductLoginPath(product: AuthProduct, nextPath: string) {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : getProductFallbackPath(product);
  const encodedNext = encodeURIComponent(safeNext);

  if (product === "studio") {
    return `/studio/login?next=${encodedNext}`;
  }

  return `/login?next=${encodedNext}`;
}

export function getProductFallbackPath(product: AuthProduct) {
  const fallbackPaths: Record<AuthProduct, string> = {
    lounge: "/lounge",
    studio: "/studio/painel",
  };

  return fallbackPaths[product];
}

export async function hasProductAccess(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email"> & Partial<Pick<User, "app_metadata">>,
  product: AuthProduct
) {
  if (isAdminUser(user)) {
    return true;
  }

  const { data, error } = await supabase
    .from(productTables[product])
    .select("user_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      `Failed to check ${product} access for user ${user.id}`,
      error.message
    );
    return false;
  }

  return data?.status === "active";
}

export async function ensureProductProfile({
  product,
  supabase,
  user,
}: {
  product: AuthProduct;
  supabase: SupabaseClient;
  user: Pick<User, "id">;
}) {
  await supabase.from(productTables[product]).upsert({
    user_id: user.id,
    status: "active",
    role: getDefaultProductRole(product),
  });
}

function getDefaultProductRole(product: AuthProduct) {
  const roles: Record<AuthProduct, string> = {
    lounge: "advertiser",
    studio: "clinic_owner",
  };

  return roles[product];
}
