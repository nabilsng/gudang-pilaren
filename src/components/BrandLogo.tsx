import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export default function BrandLogo({ className }: Props) {
  return (
    <Image
      src="/logo-pilaren.png"
      alt="Gudang Pilaren"
      width={40}
      height={40}
      priority
      className={cn("h-10 w-10 rounded-md", className)}
    />
  );
}
