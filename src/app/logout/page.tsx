"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-sm text-muted-foreground">Logging out...</div>
    </main>
  );
}
