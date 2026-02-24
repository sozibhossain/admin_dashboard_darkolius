import * as React from "react";

import { cn } from "@/lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-offset-white transition focus-visible:border-[#f8b400] focus-visible:ring-2 focus-visible:ring-[#f8b400]/25",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
