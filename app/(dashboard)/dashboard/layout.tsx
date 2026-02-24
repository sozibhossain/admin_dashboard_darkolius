import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { authOptions } from "@/lib/auth-options";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#e9e9e9]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[262px] md:flex">
        <DashboardSidebar />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-[262px]">
        <header className="sticky top-0 z-30 h-20 border-b border-[#cdcdcd] bg-[#efefef] px-6">
          <DashboardTopbar />
        </header>

        <main className="min-h-[calc(100vh-80px)] bg-[#efefef] p-6 md:p-6">{children}</main>
      </div>
    </div>
  );
}

