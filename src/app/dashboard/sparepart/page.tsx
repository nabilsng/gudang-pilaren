export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getAuthFromCookie } from "@/lib/auth";
import { canManageSparepart } from "@/lib/rbac";

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

import AddSparepartDialog from "./AddSparepartDialog";
import SparepartRowActions from "./SparepartRowActions";
import { Search } from "lucide-react";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SparepartPage({ searchParams }: Props) {
  const auth = await getAuthFromCookie();
  const canManage = canManageSparepart(auth?.role);

  const sp = await searchParams;
  const raw = sp?.q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim();

  const items = await prisma.sparepart.findMany({
    where: q
      ? {
          OR: [
            { sku: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ name: "asc" }],
    take: 200,
  });

  const kritisCount = items.reduce(
    (acc, it) => acc + (it.stockQty <= it.minStock ? 1 : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Data Sparepart
            </h1>

            {!canManage && <Badge variant="secondary">Read-only</Badge>}
            {kritisCount > 0 && (
              <Badge variant="destructive">{kritisCount} kritis</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">{items.length}</span>{" "}
            item
            {q ? (
              <>
                {" "}
                untuk pencarian{" "}
                <span className="font-medium text-foreground">“{q}”</span>
              </>
            ) : null}
            .
          </p>

          {!canManage && (
            <p className="text-sm text-muted-foreground">
              Role kamu hanya bisa melihat data (tidak bisa tambah/edit/hapus).
            </p>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          {/* biar enak di mobile: tombol boleh full width */}
          <div className="w-full sm:w-auto">
            {canManage && <AddSparepartDialog />}
          </div>
        </div>
      </section>

      {/* List */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Daftar Sparepart</CardTitle>

          <form
            className="flex flex-col gap-2 sm:flex-row"
            action="/dashboard/sparepart"
            method="get"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari SKU / nama / kategori..."
                className="pl-9"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full rounded-xl sm:w-auto"
            >
              Cari
            </Button>
          </form>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* ✅ Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {items.map((it) => {
              const kritis = it.stockQty <= it.minStock;

              return (
                <div
                  key={it.id}
                  className="rounded-2xl border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-sm">{it.sku}</div>
                      <div className="mt-1 truncate font-semibold">
                        {it.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {it.category ?? "-"} • {it.unit}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {kritis ? (
                        <Badge variant="destructive">Kritis</Badge>
                      ) : (
                        <Badge variant="secondary">Aman</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl border bg-muted/20 p-2">
                      <div className="text-xs text-muted-foreground">Stok</div>
                      <div className="font-semibold tabular-nums">
                        {it.stockQty}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-2">
                      <div className="text-xs text-muted-foreground">Min</div>
                      <div className="font-semibold tabular-nums">
                        {it.minStock}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="mt-3">
                      <SparepartRowActions item={it} />
                    </div>
                  )}
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="rounded-2xl border py-10 text-center text-sm text-muted-foreground">
                Tidak ada data.
              </div>
            )}
          </div>

          {/* ✅ Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && (
                    <TableHead className="text-right">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((it) => {
                  const kritis = it.stockQty <= it.minStock;

                  return (
                    <TableRow key={it.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono">{it.sku}</TableCell>
                      <TableCell className="font-medium">{it.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {it.category ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {it.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.stockQty}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.minStock}
                      </TableCell>
                      <TableCell>
                        {kritis ? (
                          <Badge variant="destructive">Kritis</Badge>
                        ) : (
                          <Badge variant="secondary">Aman</Badge>
                        )}
                      </TableCell>

                      {canManage && (
                        <TableCell className="text-right">
                          <SparepartRowActions item={it} />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 8 : 7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data.
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
