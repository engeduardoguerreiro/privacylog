"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  type ClinicPhotoFormState,
  saveClinicAtmospherePhotos,
} from "./actions";

const initialState: ClinicPhotoFormState = {
  type: "idle",
  message: "",
};

export default function ClinicPhotoUploadForm({ slug }: { slug: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    saveClinicAtmospherePhotos.bind(null, slug),
    initialState
  );

  useEffect(() => {
    if (state.type === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.type]);

  return (
    <form ref={formRef} action={action} className="clinic-admin-photo-form">
      <h2>Atualizar imagens</h2>
      <p>As fotos são redimensionadas automaticamente para manter a página bonita e leve.</p>

      {state.type === "success" ? (
        <p className="clinic-admin-success" role="status">
          {state.message}
        </p>
      ) : null}
      {state.type === "error" ? (
        <p className="clinic-admin-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <div>
        {[1, 2, 3, 4].map((item) => (
          <label key={item}>
            Foto {item}
            <input name={`photo${item}`} type="file" accept="image/*" disabled={pending} />
          </label>
        ))}
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "Salvando fotos..." : "Salvar fotos da clínica"}
      </button>
    </form>
  );
}
