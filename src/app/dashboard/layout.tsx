import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthFromCookie } from "@/lib/auth";
import { canViewDashboard } from "@/lib/rbac";

import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getAuthFromCookie();

  if (!auth) redirect("/login?next=/dashboard");
  if (!canViewDashboard(auth.role)) redirect("/login?next=/dashboard");

  return (
    <DashboardShell user={{ username: auth.username, role: auth.role }}>
      {children}
    </DashboardShell>
  );
}
