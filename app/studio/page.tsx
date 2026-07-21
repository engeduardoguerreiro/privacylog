import ClinicCarousel from "@/components/studio/ClinicCarousel";
import HowItWorks from "@/components/studio/HowItWorks";
import StudioDashboardShowcase from "@/components/studio/StudioDashboardShowcase";
import StudioHero from "@/components/studio/StudioHero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "PrivacyLog Studio | Sites Premium para Clínicas e Privês",
  description:
    "Sites premium e vitrines de alto impacto para clínicas, privês, lounges e marcas adultas que querem vender com luxo e discrição.",
  product: "studio",
});

export default function StudioPage() {
  return (
    <main className="studio-shell">
      <StudioHero />
      <ClinicCarousel />
      <HowItWorks />
      <StudioDashboardShowcase />
    </main>
  );
}
