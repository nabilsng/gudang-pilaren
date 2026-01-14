export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getAuthFromCookie } from "@/lib/auth";
import { withMinDelay } from "@/lib/min-delay";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatTanggalID(d: Date) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const auth = await getAuthFromCookie();

  // Range "hari ini" (mengikuti timezone server/dev kamu)
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [totalSparepart, rows, masukAgg, keluarAgg] = await withMinDelay(
    Promise.all([
      prisma.sparepart.count(),

      prisma.sparepart.findMany({
        select: { stockQty: true, minStock: true },
        take: 5000,
      }),

      prisma.stockMovement.aggregate({
        where: { type: "IN", createdAt: { gte: startOfDay, lt: endOfDay } },
        _sum: { qty: true },
      }),

      prisma.stockMovement.aggregate({
        where: { type: "OUT", createdAt: { gte: startOfDay, lt: endOfDay } },
        _sum: { qty: true },
      }),
    ]),
    650
  );

  const stokKritis = rows.reduce(
    (acc, r) => acc + (r.stockQty <= r.minStock ? 1 : 0),
    0
  );

  const barangMasukHariIni = masukAgg._sum.qty ?? 0;
  const barangKeluarHariIni = keluarAgg._sum.qty ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ringkasan stok dan aktivitas gudang hari ini.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTanggalID(now)}
            </p>
          </div>

          {auth && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Login:</span>
              <span className="font-medium">{auth.username}</span>
              <Badge variant="secondary">{auth.role}</Badge>
            </div>
          )}
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Kritis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-semibold tracking-tight">
              {stokKritis}
            </div>
            <div className="text-xs text-muted-foreground">
              dari total {totalSparepart} sparepart
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Barang Masuk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-semibold tracking-tight">
              {barangMasukHariIni}
            </div>
            <div className="text-xs text-muted-foreground">
              total qty masuk hari ini
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Barang Keluar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-semibold tracking-tight">
              {barangKeluarHariIni}
            </div>
            <div className="text-xs text-muted-foreground">
              total qty keluar hari ini
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Info card (lebih profesional daripada progress) */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ringkasan Cepat</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-3">
              <div className="text-xs text-muted-foreground">Catatan</div>
              <div className="mt-1">
                Angka “Masuk/Keluar” dihitung dari transaksi pada tanggal hari ini.
              </div>
            </div>
            <div className="rounded-xl border bg-background p-3">
              <div className="text-xs text-muted-foreground">Perhatian</div>
              <div className="mt-1">
                “Stok Kritis” = stok ≤ minimum. Segera lakukan pengadaan/penyesuaian.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
