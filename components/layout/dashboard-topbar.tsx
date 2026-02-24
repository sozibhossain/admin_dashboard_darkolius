"use client";

import { useSession } from "next-auth/react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
};

export function DashboardTopbar() {
  const { data: session } = useSession();

  const name =
    String(session?.user?.name || "") ||
    String((session?.user as { username?: string } | undefined)?.username || "") ||
    "Administrator";

  const avatar = String(
    (session?.user as { avatar?: { url?: string } } | undefined)?.avatar?.url || "",
  );

  return (
    <div className="flex h-full items-center justify-between">
      <h1 className="font-display text-2xl font-bold leading-none text-[#151515]">
        Dashboard
      </h1>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className="h-10 w-10 rounded-full border border-[#c7c7c7] object-cover md:h-12 md:w-12"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c7c7c7] bg-[#e7e7e7] text-sm font-bold text-[#373737] md:h-12 md:w-12">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}


