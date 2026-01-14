"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { canCreateMovement, canManageSparepart } from "@/lib/rbac";

type Props = {
  user: {
    username: string;
    role: string;
  };
  children: React.ReactNode;
};

function NavPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className="shrink-0">
      <Button
        type="button"
        variant={active ? "default" : "secondary"}
        className={cn(
          "h-9 rounded-full px-4 text-sm whitespace-nowrap",
          !active && "bg-background"
        )}
      >
        {label}
      </Button>
    </Link>
  );
}

export default function DashboardShell({ user, children }: Props) {
  const pathname = usePathname();

  const role = user?.role ?? null;

  // ✅ sesuai permintaan:
  // - Karyawan: dashboard + transaksi
  // - Kurir: dashboard saja
  // - Admin: dashboard + sparepart + transaksi
  const showSparepart = canManageSparepart(role); // ADMIN only
  const showMovement = canCreateMovement(role); // ADMIN + KARYAWAN

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8" />
            <span className="hidden text-sm font-semibold sm:inline">
              Gudang Pilaren
            </span>
          </Link>

          {/* Center: Nav (desktop) */}
          <nav className="hidden items-center gap-2 md:flex">
            <NavPill
              href="/dashboard"
              label="Dashboard"
              active={pathname === "/dashboard"}
            />

            {showSparepart && (
              <NavPill
                href="/dashboard/sparepart"
                label="Sparepart"
                active={pathname.startsWith("/dashboard/sparepart")}
              />
            )}

            {showMovement && (
              <NavPill
                href="/dashboard/movement"
                label="Transaksi"
                active={pathname.startsWith("/dashboard/movement")}
              />
            )}
          </nav>

          {/* Right: user + logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop user info */}
            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span className="text-muted-foreground">Login:</span>
              <span className="font-medium">{user.username}</span>
              <Badge variant="secondary">{user.role}</Badge>
            </div>

            {/* Mobile user info (compact) */}
            <div className="flex items-center gap-2 sm:hidden">
              <span className="text-xs text-muted-foreground">
                {user.username}
              </span>
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                {user.role}
              </Badge>
            </div>

            <form action="/api/auth/logout" method="post">
              <Button
                variant="secondary"
                className="h-9 rounded-full px-4"
                type="submit"
              >
                Logout
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="border-t md:hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <NavPill
                href="/dashboard"
                label="Dashboard"
                active={pathname === "/dashboard"}
              />

              {showSparepart && (
                <NavPill
                  href="/dashboard/sparepart"
                  label="Sparepart"
                  active={pathname.startsWith("/dashboard/sparepart")}
                />
              )}

              {showMovement && (
                <NavPill
                  href="/dashboard/movement"
                  label="Transaksi"
                  active={pathname.startsWith("/dashboard/movement")}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
