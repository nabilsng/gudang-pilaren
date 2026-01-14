export type AppRole = "ADMIN_GUDANG" | "KARYAWAN" | "KURIR";

export function isAdmin(role?: string | null) {
  return role === "ADMIN_GUDANG";
}

export function canManageSparepart(role?: string | null) {
  // CRUD master sparepart
  return isAdmin(role);
}

export function canCreateMovement(role?: string | null) {
  // bikin transaksi masuk/keluar
  return role === "ADMIN_GUDANG" || role === "KARYAWAN";
}

export function canViewDashboard(role?: string | null) {
  // kalau mau semua role boleh masuk dashboard
  return role === "ADMIN_GUDANG" || role === "KARYAWAN" || role === "KURIR";
}
