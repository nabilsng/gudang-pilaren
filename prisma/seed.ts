import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

// Ambil tipe role dari schema Prisma kamu (string / enum) => pasti valid
type Role = User["role"];

async function upsertUser(params: {
  username: string;
  name: string;
  role: Role;
  password: string;
}) {
  const passwordHash = await bcrypt.hash(params.password, 10);

  await prisma.user.upsert({
    where: { username: params.username },
    update: {
      name: params.name,
      role: params.role,
      passwordHash,
    },
    create: {
      username: params.username,
      name: params.name,
      role: params.role,
      passwordHash,
    },
  });
}

async function main() {
  await upsertUser({
    username: "admin",
    name: "Admin Gudang",
    role: "ADMIN_GUDANG" as Role,
    password: "admin123",
  });

  await upsertUser({
    username: "karyawan",
    name: "Karyawan",
    role: "KARYAWAN" as Role,
    password: "karyawan123",
  });

  await upsertUser({
    username: "kurir",
    name: "Kurir",
    role: "KURIR" as Role,
    password: "kurir123",
  });

  console.log("✅ Seed users berhasil.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
