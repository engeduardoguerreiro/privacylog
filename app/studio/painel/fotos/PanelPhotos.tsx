"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import ImageUploader from "@/app/admin/_shared/ImageUploader";
import { saveOwnPhotos, uploadOwnImage } from "../actions";

export default function PanelPhotos({ photos }: { photos: string[] }) {
  const [gallery, setGallery] = useState<string[]>(photos);

  return (
    <section className="studio-panel-card">
      <ImageUploader
        value={gallery}
        onChange={setGallery}
        uploadAction={uploadOwnImage}
        max={8}
        label="Adicionar foto"
      />

      <form action={saveOwnPhotos} style={{ marginTop: 18 }}>
        <input type="hidden" name="photos" value={JSON.stringify(gallery)} />
        <button type="submit" className="studio-button primary">
          <Save size={17} />
          Salvar galeria
        </button>
      </form>
    </section>
  );
}
