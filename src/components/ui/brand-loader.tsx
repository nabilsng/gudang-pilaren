import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandSpinner({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      aria-label="Loading"
    >
      {/* ring mewah */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          "bg-[conic-gradient(from_180deg_at_50%_50%,#f59e0b,#111827,#f59e0b)]",
          "animate-spin",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        )}
      />
      {/* inner bg */}
      <div className="absolute inset-[4px] rounded-full bg-background" />
      {/* glow lembut */}
      <div className="absolute inset-0 rounded-full blur-md opacity-30 bg-[conic-gradient(from_180deg_at_50%_50%,#f59e0b,#111827,#f59e0b)]" />

      <div className="relative z-10 grid place-items-center">
        <Image
          src="/brand/logo-pilaren.png"
          alt="Gudang Pilaren"
          width={Math.round(size * 0.52)}
          height={Math.round(size * 0.52)}
          className="rounded-md"
          priority
        />
      </div>
    </div>
  );
}

export function PageLoader({
  title = "Memuat…",
  subtitle = "Mohon tunggu sebentar",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[60vh] w-full grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <BrandSpinner size={64} />
        <div className="text-center">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

export function LoadingOverlay({
  show,
  title = "Memproses…",
  subtitle = "Jangan tutup halaman ini",
}: {
  show: boolean;
  title?: string;
  subtitle?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-md">
      <div className="rounded-2xl border bg-background/80 p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <BrandSpinner size={56} />
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
