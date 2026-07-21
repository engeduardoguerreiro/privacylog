import { CalendarDays, ChartNoAxesCombined, MessageCircle, UsersRound } from "lucide-react";

const steps = [
  {
    icon: UsersRound,
    title: "Cadastre sua clínica",
    text: "Preencha suas informações e destaque seus diferenciais em minutos.",
  },
  {
    icon: CalendarDays,
    title: "Publique modelos",
    text: "Adicione especialistas, serviços e agenda. Tudo com disponível hoje.",
  },
  {
    icon: MessageCircle,
    title: "Sua vitrine no ar",
    text: "Sua página premium fica online e pronta para ser vista.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Receba contatos",
    text: "Gere mais interesse em um canal seguro, direto e com WhatsApp.",
  },
];

export default function HowItWorks() {
  return (
    <section className="studio-process-section" id="recursos">
      <div className="studio-container">
        <div className="studio-centered-heading">
          <p className="studio-kicker">Com PrivacyLog</p>
          <h2>Simples, rápido e eficiente</h2>
          <p>Um processo pensado para dar mais tempo ao que realmente importa: seus clientes.</p>
        </div>

        <div className="studio-process-grid">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title}>
                <span>
                  <Icon size={30} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
