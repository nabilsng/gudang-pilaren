"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  next?: string;
  error?: string;
};

const inputClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginForm({ next = "/dashboard", error }: Props) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  return (
    <form
      action="/api/auth/login"
      method="post"
      className="space-y-4"
      onSubmit={() => setLoading(true)}
    >
      {/* redirect setelah login */}
      <input type="hidden" name="next" value={next} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <input
          id="username"
          name="username"
          placeholder="contoh: admin / karyawan / kurir"
          autoComplete="username"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(inputClass, "pr-10")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground">
        Gudang Pilaren — Binjai
      </div>
    </form>
  );
}
