import { normalizeHost } from "@/lib/subdomain";
import { studioClinics } from "./data";

const privacyLogDomain = "privacylog.com.br";
const reservedSubdomains = new Set([
  "www",
  "lounge",
  "forum",
  "club",
  "studio",
  "admin",
  "api",
]);

export function getStudioClinicSlugFromHost(host: string) {
  const normalizedHost = normalizeHost(host);

  if (!normalizedHost) {
    return null;
  }

  const customMatch = studioClinics.find((clinic) => {
    if (!clinic.customDomain) {
      return false;
    }

    const domain = normalizeHost(clinic.customDomain);
    const alternateDomain = domain.startsWith("www.")
      ? domain.slice(4)
      : `www.${domain}`;

    return normalizedHost === domain || normalizedHost === alternateDomain;
  });

  if (customMatch) {
    return customMatch.slug;
  }

  if (!normalizedHost.endsWith(`.${privacyLogDomain}`)) {
    return null;
  }

  const subdomain = normalizedHost.slice(
    0,
    normalizedHost.length - privacyLogDomain.length - 1
  );

  if (!subdomain || reservedSubdomains.has(subdomain) || subdomain.includes(".")) {
    return null;
  }

  const clinicMatch = studioClinics.find((clinic) => {
    const configured = clinic.clinicSubdomain
      ? normalizeHost(clinic.clinicSubdomain).replace(`.${privacyLogDomain}`, "")
      : clinic.slug;
    const compactSlug = clinic.slug.replace(/-/g, "");

    return (
      subdomain === configured ||
      subdomain === clinic.slug ||
      subdomain === compactSlug
    );
  });

  return clinicMatch?.slug || null;
}
