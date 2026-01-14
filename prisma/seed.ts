import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Hindari: import type { User/Role } dari "@prisma/client"
 * Karena pada beberapa environment build bisa tidak tersedia dan bikin Next build gagal.
 */
type Role = "ADMIN_GUDANG" | "KARYAWAN" | "KURIR";

async function upsertUser(params: {
  username: string;
  password: string;
  role: Role;
  name?: string;
}) {
  const passwordHash = await bcrypt.hash(params.password, 10);

  await prisma.user.upsert({
    where: { username: params.username },
    update: {
      passwordHash,
      role: params.role,
      name: params.name ?? params.username,
    },
    create: {
      username: params.username,
      passwordHash,
      role: params.role,
      name: params.name ?? params.username,
    },
  });
}

async function main() {
  await upsertUser({
    username: "admin",
    password: "admin123",
    role: "ADMIN_GUDANG",
    name: "Admin Gudang",
  });

  await upsertUser({
    username: "karyawan",
    password: "karyawan123",
    role: "KARYAWAN",
    name: "Karyawan",
  });

  await upsertUser({
    username: "kurir",
    password: "kurir123",
    role: "KURIR",
    name: "Kurir",
  });
}

main()
  .then(() => console.log("✅ Seed selesai"))
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
