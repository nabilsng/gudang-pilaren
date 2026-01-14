"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/brand-loader";

type FormState = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: string;
  stockQty: string;
};

const initialState: FormState = {
  sku: "",
  name: "",
  category: "",
  unit: "pcs",
  minStock: "0",
  stockQty: "0",
};

function toNumberSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

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

export default function AddSparepartDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(initialState);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const minStockNum = toNumberSafe(form.minStock);
    const stockQtyNum = toNumberSafe(form.stockQty);

    if (minStockNum < 0) {
      setError("Min Stock harus angka >= 0.");
      setLoading(false);
      return;
    }
    if (stockQtyNum < 0) {
      setError("Stock Qty harus angka >= 0.");
      setLoading(false);
      return;
    }

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim() || null,
      unit: form.unit.trim(),
      minStock: minStockNum,
      stockQty: stockQtyNum,
    };

    try {
      const res = await fetch("/api/sparepart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        setError(msg || "Gagal menambah sparepart.");
        return;
      }

      setOpen(false);
      setForm(initialState);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ? String(err.message) : "Terjadi error jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LoadingOverlay show={loading} title="Menyimpan sparepart…" subtitle="Sedang mengirim data ke server" />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setError(null);
        }}
      >
        <DialogTrigger asChild>
          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sparepart
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Sparepart</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="SP-0004"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="pcs" required />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Nama</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nama sparepart..." required />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Kategori (opsional)</Label>
                <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Contoh: Pelumas" />
              </div>

              <div className="space-y-1.5">
                <Label>Min Stock</Label>
                <Input type="number" min={0} value={form.minStock} onChange={(e) => set("minStock", e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label>Stock Qty</Label>
                <Input type="number" min={0} value={form.stockQty} onChange={(e) => set("stockQty", e.target.value)} required />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
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
