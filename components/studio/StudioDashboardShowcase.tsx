import Link from "next/link";
import {
  CheckCircle2,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Search,
  UsersRound,
} from "lucide-react";

const bullets = [
  "Página premium e personalizável para sua clínica",
  "Gerenciamento de modelos e disponibilidade em dia",
  "Links e vitrines individuais para serviços",
  "Gestão de leads e histórico",
  "Dashboard com visualizações e conversas",
  "Planos flexíveis para impulsionar sua clínica de alto valor",
];

export default function StudioDashboardShowcase() {
  return (
    <section className="studio-dashboard-section" id="sobre">
      <div className="studio-container studio-dashboard-grid">
        <div>
          <p className="studio-kicker">Desempenho que gera crescimento</p>
          <h2>Tudo que você precisa em um só lugar</h2>
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>
                <CheckCircle2 size={17} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="studio-dashboard-preview" aria-hidden="true">
          <aside>
            <img src="/brand/logo-studio.png" alt="" />
            <UsersRound size={18} />
            <Home size={18} />
            <ImageIcon size={18} />
            <Search size={18} />
          </aside>
          <section>
            <h3>Dashboard</h3>
            <div className="studio-dashboard-metrics">
              <article>
                <span>Visualizações</span>
                <strong>12.450</strong>
                <small>+27% este mês</small>
              </article>
              <article>
                <span>Contatos WhatsApp</span>
                <strong>1.220</strong>
                <small>+30% este mês</small>
              </article>
              <article>
                <span>Modelos ativas</span>
                <strong>28</strong>
                <small>Ativas</small>
              </article>
            </div>
            <div className="studio-chart">
              <span style={{ height: "42%" }} />
              <span style={{ height: "56%" }} />
              <span style={{ height: "45%" }} />
              <span style={{ height: "68%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "78%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "88%" }} />
            </div>
          </section>
        </div>
      </div>

      <div className="studio-container">
        <div className="studio-cta-band">
          <img src="/brand/logo-studio.png" alt="" />
          <div>
            <p className="studio-kicker">Pronto para elevar sua clínica?</p>
            <h2>Mais visibilidade, mais confiança, mais resultados.</h2>
            <p>Junte-se às clínicas que já transformaram sua gestão e captam mais pacientes todos os dias.</p>
          </div>
          <div>
            <Link href="/studio/solicitar-site" className="studio-button primary">
              Quero cadastrar minha clínica
            </Link>
            <Link href="/studio/contato" className="studio-cta-link">
              Falar com uma especialista
              <MessageCircle size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
