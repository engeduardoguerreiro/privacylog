import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/auth/admin";
import { ensureForumLifestyleCategoriesForAdmin } from "@/lib/forum/seed";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isAdminUser(user)) {
    redirect("/account?admin=required");
  }

  await ensureForumLifestyleCategoriesForAdmin();

  return children;
}
