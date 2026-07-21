import { EyeOff, Hourglass, MessageCircle, ShieldAlert, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Hourglass,
    title: "O cliente decide rapido e escolhe quem parece mais exclusivo",
  },
  {
    icon: EyeOff,
    title: "Grupos e listas soltas tiram o brilho da sua marca",
  },
  {
    icon: TrendingDown,
    title: "Anuncios passageiros somem antes de criar desejo",
  },
  {
    icon: ShieldAlert,
    title: "Sem uma vitrine premium, o valor percebido cai",
  },
  {
    icon: MessageCircle,
    title: "Contato confuso vira cliente perdido para a concorrencia",
  },
];

export default function ProblemSection() {
  return (
    <section className="studio-section">
      <div className="studio-container">
        <p className="studio-kicker">Desejo atrai</p>
        <h2>Sua casa precisa parecer tao valiosa quanto a experiencia que entrega</h2>
        <div className="studio-problem-grid">
          {problems.map((problem) => {
            const Icon = problem.icon;

            return (
              <article key={problem.title} className="studio-card">
                <Icon size={22} />
                <h3>{problem.title}</h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
