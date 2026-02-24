"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, ShieldCheck, ShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, productApi, subscriptionApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

const chartPath =
  "M12 188 C80 120 120 155 168 135 C212 116 250 112 300 102 C360 89 430 56 485 68 C536 79 586 59 644 72 C694 84 752 92 804 81 C860 70 912 67 980 74";

export default function DashboardOverviewPage() {
  const usersQuery = useQuery({
    queryKey: ["users", "overview"],
    queryFn: () => adminApi.getUsers({ page: 1, limit: 6 }),
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscriptions", "overview"],
    queryFn: () => subscriptionApi.getSubscriptions(),
  });

  const productQuery = useQuery({
    queryKey: ["products", "overview"],
    queryFn: () => productApi.getAll({ page: 1, limit: 8 }),
  });

  const totalSubscriptions = subscriptionQuery.data?.length ?? 0;
  const totalProducts = productQuery.data?.meta?.total ?? 0;
  const membershipsIncome = totalSubscriptions * 100;
  const productsIncome = totalProducts * 50;
  const totalIncome = membershipsIncome + productsIncome;

  return (
    <div className="space-y-6 pb-6">
      <div className="grid gap-3 lg:grid-cols-3">
        <StatCard title="Total Income" value={`$${totalIncome.toFixed(2)}`} icon={Banknote} accent="red" />
        <StatCard
          title="Total Earn From Memberships"
          value={membershipsIncome}
          icon={ShieldCheck}
          accent="blue"
        />
        <StatCard
          title="Total Earn From Product Sellings"
          value={productsIncome}
          icon={ShoppingBag}
          accent="green"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-2xl font-semibold">Total Income</CardTitle>
          <Badge variant="default" className="bg-zinc-100 text-zinc-700">
            This Week
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
            <svg
              viewBox="0 0 1000 220"
              className="h-[300px] w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label="Income chart"
            >
              <defs>
                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#295a9b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#295a9b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${chartPath} L980 220 L12 220 Z`} fill="url(#incomeArea)" />
              <path d={chartPath} fill="none" stroke="#17467f" strokeWidth="3" />
            </svg>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersQuery.isLoading ? (
            <TableSkeleton rows={6} columns={5} />
          ) : usersQuery.data?.users?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data.users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "warning" : "default"}>
                        {user.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No users found"
              description="Users will appear here after account creation."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
