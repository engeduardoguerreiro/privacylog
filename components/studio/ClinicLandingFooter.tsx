import Image from "next/image";
import { AtSign, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/studio/data";
import type { StudioClinic } from "@/lib/studio/types";
import { StudioTrackedWhatsAppLink } from "./StudioAnalyticsTracker";

export default function ClinicLandingFooter({ clinic }: { clinic: StudioClinic }) {
  const message = `Olá, vim pela vitrine da ${clinic.name} e gostaria de consultar disponibilidade para hoje.`;

  return (
    <footer className="clinic-landing-footer">
      <div className="clinic-footer-cta">
        <div className="clinic-footer-photo" aria-hidden="true">
          <Image src={clinic.mainImageUrl} alt="" fill sizes="180px" />
        </div>
        <div>
          <h2>Sua experiência de bem-estar começa aqui.</h2>
          <p>Agende sua visita e descubra um ambiente pensado para seu conforto, relaxamento e segurança.</p>
        </div>
        <div className="clinic-footer-actions">
          <StudioTrackedWhatsAppLink
            className="clinic-whatsapp-main"
            href={buildWhatsAppUrl(clinic.whatsapp, message)}
            clinicId={clinic.id}
            clinicSlug={clinic.slug}
            source="footer"
          >
            <MessageCircle size={18} />
            Agendar pelo WhatsApp
          </StudioTrackedWhatsAppLink>
          <a href="#profissionais" className="clinic-secondary-link">
            Ver profissionais disponíveis
          </a>
        </div>
        <div className="clinic-footer-logo" aria-hidden="true">
          <Image src={clinic.logoUrl} alt="" fill sizes="120px" />
        </div>
      </div>

      <div className="clinic-footer-bottom">
        <small>© 2026 {clinic.name}. Todos os direitos reservados.</small>
        <span>
          {clinic.instagram ? (
            <a href={`https://instagram.com/${clinic.instagram.replace("@", "")}`} target="_blank" rel="noreferrer">
              <AtSign size={16} />
              {clinic.instagram}
            </a>
          ) : null}
          <small>Desenvolvido por PrivacyLog Studio</small>
        </span>
      </div>
    </footer>
  );
}
