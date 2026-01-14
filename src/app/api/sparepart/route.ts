import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromCookie } from "@/lib/auth";
import { canManageSparepart } from "@/lib/rbac";

function toInt(v: unknown) {
  // terima number atau string angka
  if (typeof v === "number") return Number.isFinite(v) ? Math.trunc(v) : NaN;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : NaN;
  }
  return NaN;
}

export async function GET(req: Request) {
  const auth = await getAuthFromCookie();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

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
    orderBy: { name: "asc" },
    take: 200,
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await getAuthFromCookie();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // admin-only
  if (!canManageSparepart(auth.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Body tidak valid" }, { status: 400 });
  }

  const sku = String((body as any).sku ?? "").trim();
  const name = String((body as any).name ?? "").trim();
  const unit = String((body as any).unit ?? "pcs").trim();
  const categoryRaw = (body as any).category;
  const category =
    categoryRaw === null || categoryRaw === undefined
      ? null
      : String(categoryRaw).trim() || null;

  const minStock = toInt((body as any).minStock);
  const stockQty = toInt((body as any).stockQty);

  // validasi basic
  if (!sku || sku.length < 3) {
    return NextResponse.json({ message: "SKU wajib diisi (min 3 karakter)." }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ message: "Nama wajib diisi (min 2 karakter)." }, { status: 400 });
  }
  if (!unit) {
    return NextResponse.json({ message: "Unit wajib diisi." }, { status: 400 });
  }
  if (!Number.isFinite(minStock) || minStock < 0) {
    return NextResponse.json({ message: "Min Stock harus angka >= 0." }, { status: 400 });
  }
  if (!Number.isFinite(stockQty) || stockQty < 0) {
    return NextResponse.json({ message: "Stock Qty harus angka >= 0." }, { status: 400 });
  }

  try {
    const created = await prisma.sparepart.create({
      data: {
        sku,
        name,
        unit,
        category,
        minStock,
        stockQty,
        isActive: true,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    // Prisma unique constraint
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "SKU sudah dipakai. Gunakan SKU lain." }, { status: 400 });
    }
    return NextResponse.json({ message: e?.message ?? "Gagal membuat sparepart" }, { status: 400 });
  }
}
