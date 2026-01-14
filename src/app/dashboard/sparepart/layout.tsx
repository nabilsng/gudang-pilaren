import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthFromCookie } from "@/lib/auth";
import { canManageSparepart } from "@/lib/rbac";

export default async function SparepartLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthFromCookie();
  if (!auth) redirect("/login?next=/dashboard/sparepart");

  if (!canManageSparepart(auth.role)) redirect("/dashboard");

  return <>{children}</>;
}
