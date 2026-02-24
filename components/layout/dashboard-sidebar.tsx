"use client";

import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package2,
  Settings,
  Shapes,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subscriptions", label: "Memberships", icon: Users },
  { href: "/dashboard/trainings", label: "Training Plans", icon: User },
  { href: "/dashboard/products", label: "Product's", icon: Package2 },
  { href: "/dashboard/orders", label: "Order's", icon: Shapes },
  { href: "/dashboard/notifications", label: "Send Notice", icon: MessageSquare },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col bg-black px-6 py-7 text-white">
      <div className="mb-11 flex justify-center">
        <Image
          src="/logo.png"
          alt="Pro Factory Logo"
          width={188}
          height={84}
          className="h-auto w-[188px] object-contain"
          priority
        />
      </div>

      <nav className="flex-1 space-y-2">
        {mainNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-12 items-center gap-3 rounded-[10px] border px-4 transition-colors",
                isActive
                  ? "border-[#f3b415] bg-[#f3b415] text-white"
                  : "border-white text-white hover:bg-white/5",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="text-lg font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-8">
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex h-12 items-center gap-3 rounded-[10px] border px-4 transition-colors",
            pathname.startsWith("/dashboard/profile")
              ? "border-[#f3b415] bg-[#f3b415] text-white"
              : "border-white text-white hover:bg-white/5",
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="text-lg font-medium leading-none">
            Setting
          </span>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-12 w-full items-center gap-3 rounded-[10px] bg-[#f51212] px-4 text-left text-white transition-colors hover:bg-[#df1111]"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-lg font-medium leading-none">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}


