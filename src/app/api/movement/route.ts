import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromCookie } from "@/lib/auth";
import { MovementType } from "@prisma/client";
import { canCreateMovement, canViewDashboard } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await getAuthFromCookie();
  if (!auth || !canViewDashboard(auth.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const items = await prisma.stockMovement.findMany({
    where: q
      ? {
          OR: [
            { sparepart: { sku: { contains: q, mode: "insensitive" } } },
            { sparepart: { name: { contains: q, mode: "insensitive" } } },
            { sparepart: { category: { contains: q, mode: "insensitive" } } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      sparepart: true,
      createdBy: { select: { id: true, username: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await getAuthFromCookie();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // RBAC: hanya ADMIN_GUDANG & KARYAWAN boleh membuat transaksi
  if (!canCreateMovement(auth.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Body tidak valid" }, { status: 400 });

  const sparepartId = String(body.sparepartId ?? "");
  const type = String(body.type ?? "") as MovementType;
  const qty = Number(body.qty ?? 0);
  const note = String(body.note ?? "").trim();

  if (!sparepartId) return NextResponse.json({ message: "sparepartId wajib" }, { status: 400 });
  if (type !== "IN" && type !== "OUT") {
    return NextResponse.json({ message: "type harus IN/OUT" }, { status: 400 });
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return NextResponse.json({ message: "qty harus > 0" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const sp = await tx.sparepart.findUnique({
        where: { id: sparepartId },
        select: { id: true, stockQty: true },
      });

      if (!sp) throw new Error("Sparepart tidak ditemukan");

      if (type === "OUT" && sp.stockQty < qty) {
        throw new Error("Stok tidak cukup untuk transaksi keluar");
      }

      await tx.stockMovement.create({
        data: {
          type,
          qty,
          note: note || null,
          sparepartId,
          createdById: auth.sub,
        },
      });

      await tx.sparepart.update({
        where: { id: sparepartId },
        data: {
          stockQty: type === "IN" ? { increment: qty } : { decrement: qty },
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Gagal membuat transaksi" },
      { status: 400 }
    );
  }
}
