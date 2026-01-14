import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

async function upsertUser(params: {
  username: string;
  name: string;
  role: Role;
  passwordPlain: string;
}) {
  const passwordHash = await bcrypt.hash(params.passwordPlain, 10);

  await prisma.user.upsert({
    where: { username: params.username },
    update: {
      name: params.name,
      role: params.role,
      isActive: true,
      // reset password tiap seed (biar enak testing)
      passwordHash,
    },
    create: {
      name: params.name,
      username: params.username,
      passwordHash,
      role: params.role,
      isActive: true,
    },
  });
}

async function main() {
  // ===== Users for testing RBAC =====
  await upsertUser({
    username: "admin",
    name: "Admin Gudang",
    role: "ADMIN_GUDANG",
    passwordPlain: "admin123",
  });

  await upsertUser({
    username: "karyawan",
    name: "User Karyawan",
    role: "KARYAWAN",
    passwordPlain: "karyawan123",
  });

  await upsertUser({
    username: "kurir",
    name: "User Kurir",
    role: "KURIR",
    passwordPlain: "kurir123",
  });

  // ===== Sparepart contoh =====
  const items = [
    {
      sku: "SP-0001",
      name: "Oli Mesin",
      category: "Pelumas",
      unit: "pcs",
      minStock: 5,
      stockQty: 20,
    },
    {
      sku: "SP-0002",
      name: "Filter Udara",
      category: "Filter",
      unit: "pcs",
      minStock: 3,
      stockQty: 10,
    },
    {
      sku: "SP-0003",
      name: "Busi",
      category: "Elektrik",
      unit: "pcs",
      minStock: 10,
      stockQty: 50,
    },
  ];

  for (const it of items) {
    await prisma.sparepart.upsert({
      where: { sku: it.sku },
      update: {
        name: it.name,
        category: it.category,
        unit: it.unit,
        minStock: it.minStock,
        stockQty: it.stockQty,
        isActive: true,
      },
      create: {
        ...it,
        isActive: true,
      },
    });
  }

  console.log("✅ Seed selesai: admin + karyawan + kurir + sparepart contoh");
  console.log("🔐 Login test:");
  console.log("   admin / admin123");
  console.log("   karyawan / karyawan123");
  console.log("   kurir / kurir123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
