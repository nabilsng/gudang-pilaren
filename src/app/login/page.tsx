export const dynamic = "force-dynamic";

import BrandLogo from "@/components/BrandLogo";
import LoginForm from "@/app/login/LoginForm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Boxes, ShieldCheck } from "lucide-react";

type Props = {
  searchParams?: {
    next?: string | string[];
    error?: string | string[];
  };
};

function pickOne(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default function LoginPage({ searchParams }: Props) {
  const next = (pickOne(searchParams?.next) ?? "/dashboard").trim();
  const error = (pickOne(searchParams?.error) ?? "").trim();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
        {/* LEFT */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-9 w-9" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Sistem Gudang Pilaren
              </div>
              <div className="text-lg font-semibold">
                Keluar–Masuk Barang, Lebih Rapi.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Kontrol stok dan transaksi gudang
              <span className="block text-muted-foreground">
                dalam satu layar.
              </span>
            </h1>

            <p className="max-w-xl text-sm text-muted-foreground">
              Login untuk mencatat transaksi <b>Masuk</b> / <b>Keluar</b>, melihat
              ringkasan harian, dan menjaga stok tetap aman sesuai batas minimum.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">ADMIN / KARYAWAN / KURIR</Badge>
            <Badge variant="secondary">RBAC aktif</Badge>
            <Badge variant="secondary">Audit by user</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 font-medium">
                <ArrowLeftRight className="h-4 w-4" />
                Transaksi
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Catat Masuk/Keluar dengan validasi stok.
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 font-medium">
                <Boxes className="h-4 w-4" />
                Master Sparepart
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Data rapi, stok minimum terpantau.
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" />
                Akses Aman
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Hak akses sesuai role pengguna.
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="w-full">
          <Card className="mx-auto w-full max-w-md rounded-2xl shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Masuk untuk mengelola proses keluar–masuk barang di gudang.
              </p>
            </CardHeader>

            <CardContent>
              <LoginForm next={next} error={error} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
