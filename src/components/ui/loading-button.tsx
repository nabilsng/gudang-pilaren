"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = React.ComponentPropsWithoutRef<typeof Button> & {
  loading?: boolean;
};

export function LoadingButton({ loading = false, className, disabled, children, ...props }: Props) {
  const isDisabled = Boolean(disabled) || loading;

  return (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn("gap-2", className)}
      aria-busy={loading}
      data-loading={loading ? "true" : "false"}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
