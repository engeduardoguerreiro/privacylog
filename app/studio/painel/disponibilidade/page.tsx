import AvailabilityCalendar from "@/components/studio/AvailabilityCalendar";
import { studioClinics } from "@/lib/studio/data";

export default function StudioPanelAvailabilityPage() {
  return (
    <>
      <p className="studio-kicker">Agenda</p>
      <h1>Disponibilidade diaria e semanal</h1>
      <AvailabilityCalendar clinic={studioClinics[0]} />
    </>
  );
}
