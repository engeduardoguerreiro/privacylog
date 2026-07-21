import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import ClinicAdminFrame from "@/components/studio/ClinicAdminFrame";
import { isAdminUser } from "@/lib/auth/admin";
import { getApprovedStudioClinicBySlug } from "@/lib/studio/db";
import { createClient } from "@/lib/supabase/server";
import ClinicPhotoUploadForm from "./ClinicPhotoUploadForm";

export default async function ClinicPhotosAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/studio/clinicas/${slug}/admin/login`);
  }

  const clinic = await getApprovedStudioClinicBySlug(slug);

  if (!clinic || (clinic.ownerId !== user.id && !isAdminUser(user))) {
    redirect(`/studio/clinicas/${slug}/admin/login?access=denied`);
  }

  return (
    <ClinicAdminFrame clinic={clinic} active="photos">
      <div className="clinic-admin-dashboard-head">
        <div>
          <p className="clinic-admin-eyebrow">Atmosfera da casa</p>
          <h1>Fotos da clínica</h1>
          <span>Envie as 4 imagens exibidas na seção Atmosfera da Casa.</span>
        </div>
      </div>

      <div className="clinic-admin-photo-grid">
        {Array.from({ length: 4 }).map((_, index) => {
          const photo = clinic.photos[index] || clinic.photos[0] || clinic.mainImageUrl;

          return (
            <article key={`${photo}-${index}`}>
              <div>
                <Image src={photo} alt="" fill sizes="(max-width: 900px) 100vw, 260px" />
              </div>
              <strong>Foto {index + 1}</strong>
            </article>
          );
        })}
      </div>

      <ClinicPhotoUploadForm slug={slug} />
    </ClinicAdminFrame>
  );
}
