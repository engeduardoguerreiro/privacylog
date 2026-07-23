"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import ImageUploader from "@/app/admin/_shared/ImageUploader";
import styles from "../../../../admin.module.css";
import { saveClinicPhotos, uploadClinicImage } from "../../actions";

export default function ClinicMedia({
  clinicId,
  photos,
}: {
  clinicId: number;
  photos: string[];
}) {
  const [gallery, setGallery] = useState<string[]>(photos);

  return (
    <section className={styles.formSection}>
      <h2 className={styles.formSectionTitle}>Fotos da casa</h2>

      <ImageUploader
        value={gallery}
        onChange={setGallery}
        uploadAction={uploadClinicImage}
        max={8}
        label="Adicionar foto"
      />

      <form action={saveClinicPhotos} style={{ marginTop: 18 }}>
        <input type="hidden" name="id" value={clinicId} />
        <input type="hidden" name="photos" value={JSON.stringify(gallery)} />
        <button type="submit" className={styles.submitBtn}>
          <Save size={18} />
          Salvar fotos
        </button>
      </form>
    </section>
  );
}
