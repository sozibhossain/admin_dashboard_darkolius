import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition ring-offset-white placeholder:text-zinc-400 focus-visible:border-[#f8b400] focus-visible:ring-2 focus-visible:ring-[#f8b400]/25",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
