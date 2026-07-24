import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import RegisterClinicForm from "./RegisterClinicForm";

export const metadata = pageMetadata({
  title: "Cadastre a sua casa | PrivacyLog",
  description:
    "Crie a conta da sua casa, escolha o plano e ative a página premium PrivacyLog com pagamento pelo Mercado Pago.",
  product: "studio",
  path: "/cadastro",
});

export default function StudioSignupPage() {
  return (
    <main className="studio-shell">
      <section className="studio-page-hero">
        <div className="studio-container studio-auth-wrap">
          <div>
            <p className="studio-kicker">Cadastro da casa</p>
            <h1>Coloque a sua casa no PrivacyLog</h1>
            <p>
              Preencha os dados da casa, crie o seu acesso e escolha o plano.
              Em seguida você conclui o pagamento e a página entra no ar.
            </p>
            <p style={{ marginTop: 16 }}>
              Já tem conta?{" "}
              <Link href="/studio/login?next=/studio/painel">Entrar</Link>
            </p>
          </div>
          <RegisterClinicForm />
        </div>
      </section>
    </main>
  );
}
