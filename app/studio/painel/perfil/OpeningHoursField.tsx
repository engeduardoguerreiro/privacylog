"use client";

import { useMemo, useState } from "react";

const DAYS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

type Day = (typeof DAYS)[number];
type DayState = { status: "open" | "closed"; open: string; close: string };

// Opcoes de horario de 30 em 30 minutos (00:00 ... 23:30).
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Casa o nome do dia salvo (com/sem acento, minusculo) ao dia canonico.
function matchDay(raw: string): Day | null {
  const key = stripAccents(raw).trim().toLowerCase();
  return (
    DAYS.find((d) => stripAccents(d).toLowerCase() === key) ||
    (key.startsWith("seg")
      ? "Segunda"
      : key.startsWith("ter")
      ? "Terça"
      : key.startsWith("qua")
      ? "Quarta"
      : key.startsWith("qui")
      ? "Quinta"
      : key.startsWith("sex")
      ? "Sexta"
      : key.startsWith("sab")
      ? "Sábado"
      : key.startsWith("dom")
      ? "Domingo"
      : null)
  );
}

function buildInitial(entries: { day: string; hours: string }[]) {
  const state: Record<Day, DayState> = {
    Segunda: { status: "closed", open: "09:00", close: "18:00" },
    Terça: { status: "closed", open: "09:00", close: "18:00" },
    Quarta: { status: "closed", open: "09:00", close: "18:00" },
    Quinta: { status: "closed", open: "09:00", close: "18:00" },
    Sexta: { status: "closed", open: "09:00", close: "18:00" },
    Sábado: { status: "closed", open: "09:00", close: "18:00" },
    Domingo: { status: "closed", open: "09:00", close: "18:00" },
  };

  for (const entry of entries) {
    const day = matchDay(entry.day);
    if (!day) continue;

    const hours = entry.hours || "";
    if (/fechad/i.test(hours) || !hours.trim()) {
      state[day] = { ...state[day], status: "closed" };
      continue;
    }

    const found = hours.match(/(\d{1,2}):(\d{2})/g) || [];
    const open = found[0] ? found[0].padStart(5, "0") : state[day].open;
    const close = found[1] ? found[1].padStart(5, "0") : state[day].close;
    state[day] = { status: "open", open, close };
  }

  return state;
}

export default function OpeningHoursField({
  initial,
}: {
  initial: { day: string; hours: string }[];
}) {
  const [state, setState] = useState<Record<Day, DayState>>(() =>
    buildInitial(initial)
  );

  // Serializa no mesmo formato que o servidor ja entende
  // ("Segunda: 11:00 às 19:00" ou "Domingo: Fechado").
  const serialized = useMemo(
    () =>
      DAYS.map((day) => {
        const s = state[day];
        return s.status === "closed"
          ? `${day}: Fechado`
          : `${day}: ${s.open} às ${s.close}`;
      }).join("\n"),
    [state]
  );

  function update(day: Day, patch: Partial<DayState>) {
    setState((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  return (
    <div className="studio-hours">
      <span className="studio-hours-title">Horários de funcionamento</span>
      <p className="studio-hours-hint">
        Selecione o horário de cada dia. Marque “Fechado” nos dias em que a casa
        não abre.
      </p>

      <div className="studio-hours-list">
        {DAYS.map((day) => {
          const s = state[day];
          const open = s.status === "open";
          return (
            <div
              key={day}
              className={`studio-hours-row${open ? "" : " is-closed"}`}
            >
              <span className="studio-hours-day">{day}</span>

              <select
                aria-label={`Situação de ${day}`}
                value={s.status}
                onChange={(e) =>
                  update(day, { status: e.target.value as DayState["status"] })
                }
                className="studio-hours-status"
              >
                <option value="open">Aberto</option>
                <option value="closed">Fechado</option>
              </select>

              {open ? (
                <div className="studio-hours-times">
                  <select
                    aria-label={`Abre em ${day}`}
                    value={s.open}
                    onChange={(e) => update(day, { open: e.target.value })}
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="studio-hours-sep">às</span>
                  <select
                    aria-label={`Fecha em ${day}`}
                    value={s.close}
                    onChange={(e) => update(day, { close: e.target.value })}
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="studio-hours-closed-tag">Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      <input type="hidden" name="opening_hours" value={serialized} />
    </div>
  );
}
