"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/brand-loader";

type SparepartMini = { id: string; sku: string; name: string };

async function readErrorMessage(res: Response) {
  try {
    const data = await res.json();
    if (data?.message) return String(data.message);
  } catch {}
  try {
    const text = await res.text();
    if (text?.trim()) return text.trim();
  } catch {}
  return `Request gagal (HTTP ${res.status})`;
}

export default function AddMovementDialog({ spareparts }: { spareparts: SparepartMini[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const sparepartId = String(fd.get("sparepartId") || "");
    const type = String(fd.get("type") || "IN");
    const qty = Number(fd.get("qty") || 0);
    const note = String(fd.get("note") || "").trim();

    if (!sparepartId) {
      setErr("Sparepart wajib dipilih.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setErr("Qty harus angka > 0.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sparepartId, type, qty, note }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg || "Gagal menyimpan transaksi.");
      }

      setOpen(false);
      e.currentTarget.reset();
      router.refresh();
    } catch (e: any) {
      setErr(String(e?.message || "Error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LoadingOverlay show={loading} title="Menyimpan transaksi…" subtitle="Stok akan otomatis diperbarui" />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setErr(null);
        }}
      >
        <DialogTrigger asChild>
          <Button>Tambah Transaksi</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi Stok</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmit}>
            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Sparepart</Label>
              <select
                name="sparepartId"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                required
                defaultValue={spareparts[0]?.id ?? ""}
              >
                {spareparts.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.sku} — {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipe</Label>
                <select name="type" className="h-10 w-full rounded-md border bg-background px-3 text-sm" defaultValue="IN">
                  <option value="IN">Masuk</option>
                  <option value="OUT">Keluar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Qty</Label>
                <Input name="qty" type="number" min={1} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Catatan (opsional)</Label>
              <Input name="note" placeholder="contoh: retur / pemakaian / pembelian..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
                Batal
              </Button>

              <LoadingButton type="submit" loading={loading}>
                Simpan
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
