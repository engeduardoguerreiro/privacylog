export type StudioPlanSlug = "essential" | "premium" | "black";

export type StudioOpeningHour = {
  day: string;
  hours: string;
  closed?: boolean;
};

export type StudioProfessionalStatus =
  | "available_now"
  | "available_today"
  | "booked"
  | "unavailable";

export type StudioProfessional = {
  id: number;
  clinicId: number;
  stageName: string;
  slug: string;
  age?: number;
  shortDescription: string;
  bio: string;
  mainPhotoUrl: string;
  photos: string[];
  whatsapp?: string;
  status: StudioProfessionalStatus;
  availabilityWindow: string;
  isActive: boolean;
  isAvailableToday: boolean;
  isFeatured: boolean;
  tags: string[];
  services: string[];
};

export type StudioClinic = {
  id: number;
  ownerId?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  businessType: string;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  latitude?: number;
  longitude?: number;
  whatsapp: string;
  phone?: string;
  instagram?: string;
  website?: string;
  studioPath: string;
  clinicSubdomain?: string;
  customDomain?: string;
  customDomainIncludedUntil?: string;
  domainRenewalNote?: string;
  logoUrl: string;
  mainImageUrl: string;
  status: "pending" | "approved" | "suspended";
  plan: StudioPlanSlug;
  isPartner: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  openingHours: StudioOpeningHour[];
  paymentMethods: string[];
  services: string[];
  rules: string;
  photos: string[];
  professionals: StudioProfessional[];
};

export type StudioPlan = {
  slug: StudioPlanSlug;
  name: string;
  price: string;
  audience: string;
  highlight: string;
  digitalAddress: {
    title: string;
    value: string;
    note: string;
  };
  features: string[];
};
