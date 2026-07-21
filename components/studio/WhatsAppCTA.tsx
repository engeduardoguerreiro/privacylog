import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/studio/data";
import { StudioTrackedWhatsAppLink } from "./StudioAnalyticsTracker";

export default function WhatsAppCTA({
  clinicId,
  clinicSlug,
  number,
  message,
  professionalId,
  source,
  label = "Chamar no WhatsApp",
}: {
  clinicId?: number;
  clinicSlug?: string;
  number: string;
  message: string;
  professionalId?: number;
  source?: string;
  label?: string;
}) {
  const href = buildWhatsAppUrl(number, message);
  const content = (
    <>
      <MessageCircle size={18} />
      {label}
    </>
  );

  if (clinicId && clinicSlug) {
    return (
      <StudioTrackedWhatsAppLink
        className="studio-whatsapp-cta"
        href={href}
        clinicId={clinicId}
        clinicSlug={clinicSlug}
        professionalId={professionalId}
        source={source}
      >
        {content}
      </StudioTrackedWhatsAppLink>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="studio-whatsapp-cta"
    >
      {content}
    </a>
  );
}
