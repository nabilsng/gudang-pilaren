"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/brand-loader";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Sparepart = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  unit: string;
  minStock: number;
  stockQty: number;
};

type FormState = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: string;
  stockQty: string;
};

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

function toNumberSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function SparepartRowActions({ item }: { item: Sparepart }) {
  const router = useRouter();
  const [openEdit, setOpenEdit] = React.useState(false);
  const [loadingEdit, setLoadingEdit] = React.useState(false);
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const showOverlay = loadingEdit || loadingDelete;

  const [form, setForm] = React.useState<FormState>({
    sku: item.sku,
    name: item.name,
    category: item.category ?? "",
    unit: item.unit,
    minStock: String(item.minStock),
    stockQty: String(item.stockQty),
  });

  React.useEffect(() => {
    setForm({
      sku: item.sku,
      name: item.name,
      category: item.category ?? "",
      unit: item.unit,
      minStock: String(item.minStock),
      stockQty: String(item.stockQty),
    });
  }, [item.id, item.sku, item.name, item.category, item.unit, item.minStock, item.stockQty]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoadingEdit(true);
    setError(null);

    const minStockNum = toNumberSafe(form.minStock);
    const stockQtyNum = toNumberSafe(form.stockQty);

    if (!Number.isFinite(minStockNum) || minStockNum < 0) {
      setError("Min Stock harus angka >= 0.");
      setLoadingEdit(false);
      return;
    }
    if (!Number.isFinite(stockQtyNum) || stockQtyNum < 0) {
      setError("Stock Qty harus angka >= 0.");
      setLoadingEdit(false);
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
      const res = await fetch(`/api/sparepart/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        setError(msg || "Gagal update sparepart.");
        return;
      }

      setOpenEdit(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ? String(err.message) : "Terjadi error jaringan.");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function onDelete() {
    setLoadingDelete(true);
    setError(null);

    try {
      const res = await fetch(`/api/sparepart/${item.id}`, { method: "DELETE" });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        setError(msg || "Gagal hapus sparepart.");
        return;
      }

      router.refresh();
    } catch (err: any) {
      setError(err?.message ? String(err.message) : "Terjadi error jaringan.");
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <>
      <LoadingOverlay
        show={showOverlay}
        title={loadingDelete ? "Menghapus sparepart…" : "Menyimpan perubahan…"}
        subtitle="Sedang memproses di server"
      />

      <div className="flex items-center justify-end gap-2">
        {/* EDIT */}
        <Dialog
          open={openEdit}
          onOpenChange={(v) => {
            setOpenEdit(v);
            if (!v) setError(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="rounded-xl">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Sparepart</DialogTitle>
            </DialogHeader>

            <form onSubmit={onUpdate} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
                </div>

                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input value={form.unit} onChange={(e) => set("unit", e.target.value)} required />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nama</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Kategori (opsional)</Label>
                  <Input value={form.category} onChange={(e) => set("category", e.target.value)} />
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpenEdit(false)} disabled={loadingEdit}>
                  Batal
                </Button>

                <LoadingButton type="submit" loading={loadingEdit}>
                  Simpan
                </LoadingButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="rounded-xl" disabled={loadingDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus sparepart ini?</AlertDialogTitle>
              <AlertDialogDescription>
                Data <b>{item.sku}</b> — {item.name} akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {error && (
              <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={loadingDelete}>Batal</AlertDialogCancel>

              {/* AlertDialogAction adalah button; kita tetap tampilkan teks berubah */}
              <AlertDialogAction onClick={onDelete} disabled={loadingDelete}>
                {loadingDelete ? "Menghapus..." : "Ya, Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
