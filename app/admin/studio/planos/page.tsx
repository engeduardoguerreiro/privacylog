import StudioPlanCard from "@/components/studio/StudioPlanCard";
import { studioPlans } from "@/lib/studio/data";

export default function AdminStudioPlansPage() {
  return (
    <main className="studio-shell p-8">
      <section className="studio-container">
        <p className="studio-kicker">Admin Studio</p>
        <h1>Planos comerciais</h1>
        <div className="studio-plan-grid">
          {studioPlans.map((plan) => (
            <StudioPlanCard key={plan.slug} plan={plan} />
          ))}
        </div>
      </section>
    </main>
  );
}
