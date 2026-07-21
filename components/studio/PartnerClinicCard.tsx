import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import {
  getPlanLabel,
  getStudioClinicPrimaryUrl,
  getStudioClinicPublicPath,
} from "@/lib/studio/data";
import type { StudioClinic } from "@/lib/studio/types";

export default function PartnerClinicCard({ clinic }: { clinic: StudioClinic }) {
  const clinicPath = getStudioClinicPublicPath(clinic);
  const coverImage = clinic.photos[0] || clinic.mainImageUrl;

  return (
    <article className={`studio-clinic-card plan-${clinic.plan}`}>
      <Link
        href={clinicPath}
        className="studio-clinic-media"
        aria-label={`Conhecer ${clinic.name}`}
      >
        <Image src={coverImage} alt="" fill sizes="320px" />
      </Link>
      <div className="studio-clinic-body">
        <div className="studio-badge-row">
          <span className="studio-badge gold">
            <Crown size={13} />
            {getPlanLabel(clinic.plan)}
          </span>
        </div>
        <h3>{clinic.name}</h3>
        <p>
          {clinic.neighborhood} - {clinic.city}
        </p>
        <small>{clinic.shortDescription}</small>
        <code className="studio-card-domain">{getStudioClinicPrimaryUrl(clinic).replace("https://", "")}</code>
        <div className="studio-card-actions">
          <Link href={clinicPath}>Conhecer casa</Link>
        </div>
      </div>
    </article>
  );
}
