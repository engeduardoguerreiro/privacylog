import AuthForm from "@/app/login/AuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Login Studio",
  description: "Acesse sua vitrine PrivacyLog Studio.",
  product: "studio",
  path: "/login",
});

export default function StudioLoginPage() {
  return (
    <main className="studio-shell">
      <section className="studio-page-hero">
        <div className="studio-container studio-auth-wrap">
          <div>
            <p className="studio-kicker">Area exclusiva</p>
            <h1>Controle a vitrine da sua marca</h1>
            <p>
              Mantenha sua casa desejada todos os dias: equipe em destaque,
              fotos impecaveis e reservas mais faceis pelo WhatsApp.
            </p>
          </div>
          <AuthForm nextPath="/studio/painel" product="studio" />
        </div>
      </section>
    </main>
  );
}
