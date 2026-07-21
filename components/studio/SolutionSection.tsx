import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Pagina com aparencia de marca de alto padrao",
  "Clima visual de luxo, reserva e desejo",
  "Profissionais em evidencia com status do dia",
  "Galerias que valorizam ambiente, equipe e experiencia",
  "Botao de reserva direto no WhatsApp",
  "Endereco digital bonito para divulgar em grupos e redes",
  "Presenca em vitrines parceiras do PrivacyLog",
  "Destaque para planos Premium e Black",
  "Textos pensados para converter curiosidade em contato",
  "Mais forca para aparecer em busca, mapa e campanhas",
  "Artes para Status com cara de marca premium",
  "Mais autoridade antes mesmo do primeiro atendimento",
];

export default function SolutionSection() {
  return (
    <section className="studio-section studio-section-alt">
      <div className="studio-container studio-solution-grid">
        <div>
          <p className="studio-kicker">Vitrine de luxo</p>
          <h2 className="studio-solution-title">
            A primeira impressao precisa seduzir antes do WhatsApp tocar
          </h2>
          <p>
            O PrivacyLog Studio transforma sua casa em uma vitrine comercial
            elegante: uma pagina feita para despertar desejo, transmitir
            confianca e levar o cliente certo para a reserva.
          </p>
        </div>
        <div className="studio-benefit-grid">
          {benefits.map((benefit) => (
            <span key={benefit}>
              <CheckCircle2 size={16} />
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
