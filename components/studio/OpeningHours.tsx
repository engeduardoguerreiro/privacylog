import { Clock3 } from "lucide-react";
import type { StudioOpeningHour } from "@/lib/studio/types";

export default function OpeningHours({ hours }: { hours: StudioOpeningHour[] }) {
  const openNow = isOpenNow(hours);

  return (
    <div className="studio-hours">
      <span className={`studio-badge ${openNow ? "is-live" : ""}`}>
        <Clock3 size={14} />
        {openNow ? "Aberto agora" : "Fechado agora"}
      </span>
      {hours.map((item) => (
        <div key={item.day}>
          <span>{item.day}</span>
          <strong className={item.closed ? "is-closed" : ""}>{item.hours}</strong>
        </div>
      ))}
    </div>
  );
}

function isOpenNow(hours: StudioOpeningHour[]) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = normalizeDay(parts.find((part) => part.type === "weekday")?.value || "");
  const currentHour = Number(parts.find((part) => part.type === "hour")?.value || "0");
  const currentMinute = Number(parts.find((part) => part.type === "minute")?.value || "0");
  const currentMinutes = currentHour * 60 + currentMinute;
  const today = hours.find((item) => normalizeDay(item.day) === weekday);

  if (!today || today.closed) {
    return false;
  }

  const match = today.hours.match(/(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/);

  if (!match) {
    return false;
  }

  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  return end < start
    ? currentMinutes >= start || currentMinutes <= end
    : currentMinutes >= start && currentMinutes <= end;
}

function normalizeDay(day: string) {
  return day
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .slice(0, 3);
}
