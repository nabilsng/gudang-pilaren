import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthFromCookie } from "@/lib/auth";
import { canCreateMovement } from "@/lib/rbac";

export default async function MovementLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthFromCookie();
  if (!auth) redirect("/login?next=/dashboard/movement");

  // di app kamu: canCreateMovement = ADMIN_GUDANG atau KARYAWAN
  if (!canCreateMovement(auth.role)) redirect("/dashboard");

  return <>{children}</>;
}
