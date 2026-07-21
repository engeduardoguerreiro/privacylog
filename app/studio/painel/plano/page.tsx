import StudioPlanCard from "@/components/studio/StudioPlanCard";
import { studioPlans } from "@/lib/studio/data";

export default function StudioPanelPlanPage() {
  return (
    <>
      <p className="studio-kicker">Plano</p>
      <h1>Plano atual e upgrades</h1>
      <div className="studio-plan-grid">
        {studioPlans.map((plan) => (
          <StudioPlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
    </>
  );
}
