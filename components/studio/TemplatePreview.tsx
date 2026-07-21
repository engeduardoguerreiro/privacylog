import { MonitorSmartphone } from "lucide-react";
import type { CSSProperties } from "react";

export default function TemplatePreview({
  name,
  tone,
  accent,
}: {
  name: string;
  tone: string;
  accent: string;
}) {
  return (
    <article className="studio-template-card" style={{ "--template-accent": accent } as CSSProperties}>
      <div className="studio-template-preview">
        <MonitorSmartphone size={30} />
        <span />
        <span />
      </div>
      <h3>{name}</h3>
      <p>{tone}</p>
    </article>
  );
}
