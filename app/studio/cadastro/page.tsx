import AuthForm from "@/app/login/AuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cadastro Studio",
  description: "Crie acesso para entrar na vitrine premium PrivacyLog Studio.",
  product: "studio",
  path: "/cadastro",
});

export default function StudioSignupPage() {
  return (
    <main className="studio-shell">
      <section className="studio-page-hero">
        <div className="studio-container studio-auth-wrap">
          <div>
            <p className="studio-kicker">Entrada reservada</p>
            <h1>Comece a construir uma marca mais desejada</h1>
            <p>
              Cadastre o acesso da sua casa e nossa equipe prepara a liberacao
              para sua vitrine ganhar presenca, brilho e conversao.
            </p>
          </div>
          <AuthForm
            initialMode="signup"
            nextPath="/studio/painel"
            product="studio"
          />
        </div>
      </section>
    </main>
  );
}
