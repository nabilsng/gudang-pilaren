import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromCookie } from "@/lib/auth";
import { canManageSparepart } from "@/lib/rbac";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!canManageSparepart(auth.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Body tidak valid" }, { status: 400 });

  const data: any = {};
  if (body.sku !== undefined) data.sku = String(body.sku).trim();
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.category !== undefined) data.category = String(body.category).trim() || null;
  if (body.unit !== undefined) data.unit = String(body.unit).trim() || "pcs";
  if (body.rackLoc !== undefined) data.rackLoc = String(body.rackLoc).trim() || null;
  if (body.minStock !== undefined) data.minStock = Number(body.minStock);
  if (body.stockQty !== undefined) data.stockQty = Number(body.stockQty);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (data.minStock !== undefined && (!Number.isFinite(data.minStock) || data.minStock < 0)) {
    return NextResponse.json({ message: "minStock harus >= 0" }, { status: 400 });
  }
  if (data.stockQty !== undefined && (!Number.isFinite(data.stockQty) || data.stockQty < 0)) {
    return NextResponse.json({ message: "stockQty harus >= 0" }, { status: 400 });
  }

  try {
    const updated = await prisma.sparepart.update({ where: { id }, data });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Gagal update" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!canManageSparepart(auth.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    await prisma.sparepart.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Gagal hapus" }, { status: 400 });
  }
}
