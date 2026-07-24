import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import StudioDashboardSidebar from "@/components/studio/StudioDashboardSidebar";
import { hasProductAccess } from "@/lib/auth/product-access";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function StudioPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/studio/login?next=/studio/painel");
  }

  const supabase = await createClient();
  const canAccessStudio = await hasProductAccess(supabase, user, "studio");

  if (!canAccessStudio) {
    redirect("/studio/login?next=/studio/painel&access=denied");
  }

  return (
    <main className="studio-shell studio-panel-shell">
      <section className="studio-panel-layout">
        <StudioDashboardSidebar />
        <div className="studio-panel-content">{children}</div>
      </section>
    </main>
  );
}
