"use client";

import { useState } from "react";
import { CalendarDays, Save } from "lucide-react";
import type { StudioClinic } from "@/lib/studio/types";

export default function AvailabilityCalendar({ clinic }: { clinic: StudioClinic }) {
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState(
    clinic.professionals.reduce<Record<number, boolean>>((acc, professional) => {
      acc[professional.id] = professional.status !== "unavailable";
      return acc;
    }, {})
  );

  return (
    <section className="studio-panel-card">
      <div className="studio-panel-title">
        <span>
          <CalendarDays size={18} />
          Disponibilidade
        </span>
        <input type="date" defaultValue={today} />
      </div>
      <div className="studio-availability-list">
        {clinic.professionals.map((professional) => (
          <article key={professional.id}>
            <div>
              <strong>{professional.stageName}</strong>
              <small>{professional.availabilityWindow}</small>
            </div>
            <label className="studio-switch">
              <input
                type="checkbox"
                checked={selected[professional.id] || false}
                onChange={(event) =>
                  setSelected((current) => ({
                    ...current,
                    [professional.id]: event.target.checked,
                  }))
                }
              />
              <span />
            </label>
            <select defaultValue={professional.status}>
              <option value="available_now">Disponivel agora</option>
              <option value="available_today">Disponivel hoje</option>
              <option value="booked">Agenda cheia</option>
              <option value="unavailable">Indisponivel</option>
            </select>
          </article>
        ))}
      </div>
      <button type="button" className="studio-button primary">
        <Save size={16} />
        Salvar disponibilidade
      </button>
    </section>
  );
}
