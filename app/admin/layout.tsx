import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";
import styles from "./admin.module.css";

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
    redirect("/");
  }

  return (
    <div className={styles.shell}>
      <AdminNav />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
