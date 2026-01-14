export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthFromCookie } from "@/lib/auth";
import { canCreateMovement } from "@/lib/rbac";
import { withMinDelay } from "@/lib/min-delay";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import AddMovementDialog from "./AddMovementDialog";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    from?: string | string[];
    to?: string | string[];
  }>;
};

function pickOne(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function MovementPage({ searchParams }: Props) {
  const auth = await getAuthFromCookie();
  if (!auth) redirect("/login?next=/dashboard/movement");

  const role = auth.role ?? null;
  const canTransact = canCreateMovement(role);

  const sp = await searchParams;
  const q = (pickOne(sp?.q) ?? "").trim();
  const typeParam = (pickOne(sp?.type) ?? "ALL").toUpperCase();
  const from = (pickOne(sp?.from) ?? "").trim();
  const to = (pickOne(sp?.to) ?? "").trim();

  const typeFilter =
    typeParam === "IN" || typeParam === "OUT" ? typeParam : "ALL";

  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T00:00:00`) : null;

  const createdAt =
    fromDate || toDate
      ? {
          ...(fromDate ? { gte: fromDate } : {}),
          ...(toDate
            ? {
                // inclusive "to" -> lt besoknya
                lt: new Date(toDate.getTime() + 24 * 60 * 60 * 1000),
              }
            : {}),
        }
      : undefined;

  const baseWhere: any = {
    ...(createdAt ? { createdAt } : {}),
    ...(q
      ? {
          OR: [
            { sparepart: { sku: { contains: q, mode: "insensitive" } } },
            { sparepart: { name: { contains: q, mode: "insensitive" } } },
            { sparepart: { category: { contains: q, mode: "insensitive" } } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const where = {
    ...baseWhere,
    ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
  };

  const [movements, spareparts, masukAgg, keluarAgg] = await withMinDelay(
    Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          sparepart: true,
          createdBy: { select: { id: true, username: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),

      canTransact
        ? prisma.sparepart.findMany({
            select: { id: true, sku: true, name: true },
            orderBy: { name: "asc" },
            take: 500,
          })
        : Promise.resolve([]),

      prisma.stockMovement.aggregate({
        where: { ...baseWhere, type: "IN" },
        _sum: { qty: true },
      }),

      prisma.stockMovement.aggregate({
        where: { ...baseWhere, type: "OUT" },
        _sum: { qty: true },
      }),
    ]),
    650
  );

  const qtyMasuk = masukAgg._sum.qty ?? 0;
  const qtyKeluar = keluarAgg._sum.qty ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Transaksi Stok</h1>
          <p className="text-sm text-muted-foreground">
            Menampilkan <b>{movements.length}</b> transaksi
            {q ? ` untuk pencarian "${q}"` : ""}.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto">
            {canTransact ? (
              <AddMovementDialog spareparts={spareparts as any} />
            ) : (
              <Badge variant="secondary" className="h-9 w-fit">
                Read-only
              </Badge>
            )}
          </div>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Kembali
            </Button>
          </Link>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{movements.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              maks 200 item ditampilkan
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qty Masuk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{qtyMasuk}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              sesuai filter
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qty Keluar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{qtyKeluar}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              sesuai filter
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Riwayat */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>Riwayat Transaksi</CardTitle>

          {/* ✅ Responsive filters */}
          <form
            className="grid gap-2 sm:grid-cols-12"
            action="/dashboard/movement"
            method="get"
          >
            <div className="sm:col-span-5">
              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari SKU / nama / kategori / catatan..."
              />
            </div>

            <div className="sm:col-span-2">
              <select
                name="type"
                defaultValue={typeFilter}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="ALL">Semua</option>
                <option value="IN">Masuk</option>
                <option value="OUT">Keluar</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Input name="from" type="date" defaultValue={from} />
            </div>

            <div className="sm:col-span-2">
              <Input name="to" type="date" defaultValue={to} />
            </div>

            <div className="sm:col-span-1">
              <Button type="submit" className="w-full">
                Cari
              </Button>
            </div>
          </form>

          {(from || to) && (
            <div className="text-xs text-muted-foreground">
              Filter tanggal aktif: {from || "…"} s/d {to || "…"}
            </div>
          )}

          {!canTransact && (
            <div className="text-sm text-muted-foreground">
              Role kamu hanya bisa melihat transaksi (tidak bisa tambah
              transaksi).
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* ✅ Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {movements.map((m) => {
              const isOut = m.type === "OUT";
              const by = m.createdBy?.name || m.createdBy?.username || "-";
              const when = new Date(m.createdAt).toLocaleString();

              return (
                <div
                  key={m.id}
                  className="rounded-2xl border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-mono text-sm">
                          {m.sparepart.sku}
                        </div>
                        {isOut ? (
                          <Badge variant="destructive">Keluar</Badge>
                        ) : (
                          <Badge variant="secondary">Masuk</Badge>
                        )}
                      </div>

                      <div className="mt-1 truncate font-semibold">
                        {m.sparepart.name}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {when} • oleh {by}
                      </div>

                      {m.note ? (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Catatan:
                          </span>{" "}
                          {m.note}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">Qty</div>
                      <div className="text-lg font-semibold tabular-nums">
                        {m.qty}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {movements.length === 0 && (
              <div className="rounded-2xl border py-10 text-center text-sm text-muted-foreground">
                Belum ada transaksi.
              </div>
            )}
          </div>

          {/* ✅ Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Oleh</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {movements.map((m) => {
                  const isOut = m.type === "OUT";
                  const by = m.createdBy?.name || m.createdBy?.username || "-";

                  return (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {m.sparepart.sku}
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.sparepart.name}
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          <Badge variant="destructive">Keluar</Badge>
                        ) : (
                          <Badge variant="secondary">Masuk</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {m.qty}
                      </TableCell>
                      <TableCell>{m.note ?? "-"}</TableCell>
                      <TableCell>{by}</TableCell>
                    </TableRow>
                  );
                })}

                {movements.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Belum ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
