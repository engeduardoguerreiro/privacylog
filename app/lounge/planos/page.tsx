import Footer from "@/components/layout/Footer";
import ProductHeader from "@/components/layout/ProductHeader";
import LoungePlanCard, { type LoungePlan } from "@/components/lounge/LoungePlanCard";
import { pageMetadata } from "@/lib/seo";

const plans: LoungePlan[] = [
  {
    name: "Plano Básico",
    price: "R$ 39,90/mês",
    features: [
      "Página do estabelecimento",
      "Foto principal",
      "WhatsApp",
      "Exibição na listagem",
    ],
  },
  {
    name: "Plano Destaque",
    price: "R$ 69,90/mês",
    featured: true,
    features: [
      "Tudo do Básico",
      "Destaque na cidade",
      "Galeria com mais fotos",
      "Botão premium",
      "Aparece acima dos gratuitos",
    ],
  },
  {
    name: "Plano Premium",
    price: "R$ 99,90/mês",
    features: [
      "Tudo do Destaque",
      "Destaque no carrossel principal",
      "Prioridade no mapa",
      "Selo premium",
      "Link para site próprio",
    ],
  },
];

export const metadata = pageMetadata({
  product: "lounge",
  path: "/planos",
  title: "Planos | PrivacyLog Lounge",
  description:
    "Planos de anúncio para clínicas, casas e estabelecimentos adultos no PrivacyLog Lounge.",
});

export default function LoungePlanosPage() {
  return (
    <main className="premium-shell">
      <ProductHeader product="lounge" />
      <section className="site-container py-10">
        <p className="premium-kicker">Planos Lounge</p>
        <h1 className="mt-3 text-4xl font-black text-white">
          Escolha seu destaque
        </h1>
        <p className="mt-4 max-w-2xl text-[#b8b8c8]">
          Pagamentos ficam preparados para a próxima etapa. Por enquanto, o
          contato comercial é feito por email ou WhatsApp.
        </p>
      </section>
      <section className="site-container lounge-plan-grid">
        {plans.map((plan) => (
          <LoungePlanCard key={plan.name} plan={plan} />
        ))}
      </section>
      <Footer />
    </main>
  );
}
