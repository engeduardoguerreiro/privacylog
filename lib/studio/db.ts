import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { studioClinics } from "./data";
import type {
  StudioClinic,
  StudioOpeningHour,
  StudioPlanSlug,
  StudioProfessional,
  StudioProfessionalStatus,
} from "./types";

const defaultLogo = "/brand/privacylog-mark.png";

type StudioClinicRow = {
  id: number;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  business_type: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  studio_path: string | null;
  clinic_subdomain: string | null;
  custom_domain: string | null;
  custom_domain_included_until: string | null;
  domain_renewal_note: string | null;
  logo_url: string | null;
  main_image_url: string | null;
  theme: string | null;
  status: "pending" | "approved" | "suspended";
  plan: StudioPlanSlug | string;
  is_partner: boolean | null;
  is_featured: boolean | null;
  is_verified: boolean | null;
  opening_hours: unknown;
  payment_methods: unknown;
  services: unknown;
  rules: string | null;
  studio_clinic_photos?: Array<{
    image_url: string | null;
    position: number | null;
  }> | null;
  studio_professionals?: Array<{
    id: number;
    clinic_id: number;
    stage_name: string;
    slug: string;
    age: number | null;
    short_description: string | null;
    bio: string | null;
    main_photo_url: string | null;
    status: string | null;
    is_featured: boolean | null;
    is_public: boolean | null;
    tags: unknown;
    services: unknown;
    studio_professional_photos?: Array<{
      image_url: string | null;
      position: number | null;
    }> | null;
  }> | null;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asOpeningHours(value: unknown): StudioOpeningHour[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is StudioOpeningHour => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const candidate = item as Partial<StudioOpeningHour>;
    return typeof candidate.day === "string" && typeof candidate.hours === "string";
  });
}

function normalizePlan(plan: StudioClinicRow["plan"]): StudioPlanSlug {
  return plan === "premium" || plan === "black" ? plan : "essential";
}

function normalizeStatus(status: string | null): StudioProfessionalStatus {
  if (
    status === "available_now" ||
    status === "available_today" ||
    status === "booked" ||
    status === "unavailable"
  ) {
    return status;
  }

  return "available_today";
}

function mapProfessional(row: NonNullable<StudioClinicRow["studio_professionals"]>[number]): StudioProfessional {
  const photos = (row.studio_professional_photos || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((photo) => photo.image_url)
    .filter((url): url is string => Boolean(url));
  const mainPhotoUrl = row.main_photo_url || photos[0] || defaultLogo;

  return {
    id: row.id,
    clinicId: row.clinic_id,
    stageName: row.stage_name,
    slug: row.slug,
    age: row.age || undefined,
    shortDescription: row.short_description || "",
    bio: row.bio || row.short_description || "",
    mainPhotoUrl,
    photos: photos.length > 0 ? photos.slice(0, 4) : [mainPhotoUrl],
    status: normalizeStatus(row.status),
    availabilityWindow: "Sob consulta",
    isActive: row.is_public !== false && row.status !== "unavailable",
    isAvailableToday: normalizeStatus(row.status) !== "unavailable",
    isFeatured: Boolean(row.is_featured),
    tags: asStringArray(row.tags),
    services: asStringArray(row.services),
  };
}

function mapClinic(row: StudioClinicRow): StudioClinic {
  const photos = (row.studio_clinic_photos || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((photo) => photo.image_url)
    .filter((url): url is string => Boolean(url));
  const mainImageUrl = row.main_image_url || photos[0] || row.logo_url || defaultLogo;

  const clinic: StudioClinic = {
    id: row.id,
    ownerId: row.owner_id || undefined,
    name: row.name,
    slug: row.slug,
    description: row.description || row.short_description || "",
    shortDescription: row.short_description || row.description || "",
    businessType: row.business_type || "clinica",
    city: row.city || "",
    state: row.state || "",
    neighborhood: row.neighborhood || "",
    address: row.address || "",
    latitude: row.latitude || undefined,
    longitude: row.longitude || undefined,
    whatsapp: row.whatsapp || "",
    phone: row.phone || undefined,
    instagram: row.instagram || undefined,
    website: row.website || undefined,
    studioPath: row.studio_path || `studio.privacylog.com.br/${row.slug}`,
    clinicSubdomain: row.clinic_subdomain || undefined,
    customDomain: row.custom_domain || undefined,
    customDomainIncludedUntil: row.custom_domain_included_until || undefined,
    domainRenewalNote: row.domain_renewal_note || undefined,
    logoUrl: row.logo_url || defaultLogo,
    mainImageUrl,
    theme: row.theme || "champagne",
    status: row.status,
    plan: normalizePlan(row.plan),
    isPartner: row.is_partner ?? true,
    isFeatured: Boolean(row.is_featured),
    isVerified: Boolean(row.is_verified),
    openingHours: asOpeningHours(row.opening_hours),
    paymentMethods: asStringArray(row.payment_methods),
    services: asStringArray(row.services),
    rules: row.rules || "",
    photos,
    professionals: (row.studio_professionals || []).map(mapProfessional),
  };

  return clinic;
}

/**
 * Marca d'agua da PrivacyLog usada quando a casa ainda nao enviou imagem.
 * Serve de capa em cards, mas nunca deve virar hero nem galeria.
 */
export function isPlaceholderImage(url?: string) {
  return (
    !url ||
    url.includes("/brand/") ||
    url.includes("/logo-mark") ||
    url.includes("/logo-main")
  );
}

async function getStudioClinicsFromDatabase(): Promise<StudioClinic[]> {
  const supabase = createAdminClient() || (await createClient());
  const { data, error } = await supabase
    .from("studio_clinics")
    .select(
      `
      id,
      owner_id,
      name,
      slug,
      description,
      short_description,
      business_type,
      city,
      state,
      neighborhood,
      address,
      latitude,
      longitude,
      whatsapp,
      phone,
      instagram,
      website,
      studio_path,
      clinic_subdomain,
      custom_domain,
      custom_domain_included_until,
      domain_renewal_note,
      logo_url,
      main_image_url,
      theme,
      status,
      plan,
      is_partner,
      is_featured,
      is_verified,
      opening_hours,
      payment_methods,
      services,
      rules,
      studio_clinic_photos(image_url, position),
      studio_professionals(
        id,
        clinic_id,
        stage_name,
        slug,
        age,
        short_description,
        bio,
        main_photo_url,
        status,
        is_featured,
        is_public,
        tags,
        services,
        studio_professional_photos(image_url, position)
      )
    `
    )
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load approved Studio clinics", error);
    return [];
  }

  return ((data || []) as StudioClinicRow[]).map(mapClinic);
}

export async function getApprovedStudioClinics(): Promise<StudioClinic[]> {
  const studioDatabaseClinics = await getStudioClinicsFromDatabase();
  return studioDatabaseClinics.length > 0
    ? studioDatabaseClinics
    : studioClinics.filter((clinic) => clinic.slug === "maison-aurora");
}

export async function getApprovedStudioClinicBySlug(slug: string) {
  const clinics = await getApprovedStudioClinics();
  return clinics.find((clinic) => clinic.slug === slug);
}
