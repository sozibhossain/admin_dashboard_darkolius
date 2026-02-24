"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Filter,
  MoreHorizontal,
  PackageCheck,
  Search,
  Shapes,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type OrderStatus = "New" | "Delivered" | "Cancel";

type OrderRow = {
  orderId: string;
  memberName: string;
  email: string;
  address: string;
  productName: string;
  price: number;
  status: OrderStatus;
};

const PAGE_SIZE = 10;

const MOCK_ORDERS: OrderRow[] = [
  { orderId: "#22100", memberName: "Esther Howard", email: "clctm12@gmail.com", address: "3605 Parker Rd.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22101", memberName: "Jerome Bell", email: "mr.test.nut@legmail.com", address: "8080 Railroad St.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22102", memberName: "Wade Warren", email: "fhuhung@gmail.com", address: "8080 Railroad St.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
  { orderId: "#22103", memberName: "Cody Fisher", email: "trungkien@gmail.com", address: "8080 Railroad St.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22104", memberName: "Guy Hawkins", email: "manikto8@gmail.com", address: "3890 Poplar Dr.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Cancel" },
  { orderId: "#22105", memberName: "Courtney Henry", email: "tranhvu9@gmail.com", address: "8558 Green Rd.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22106", memberName: "Robert Fox", email: "fienlopsskj@gmail.com", address: "7529 E. Pecan St.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
  { orderId: "#22107", memberName: "Cameron", email: "vuhotihtuoc@gmail.com", address: "775 Rolling Green Rd.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
  { orderId: "#22108", memberName: "Annette Black", email: "annette@gmail.com", address: "2118 Thornridge Cir.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22109", memberName: "Darrell Steward", email: "darrell@gmail.com", address: "4140 Parker Rd.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
  { orderId: "#22110", memberName: "Jenny Wilson", email: "jenny@gmail.com", address: "3517 W. Gray St.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22111", memberName: "Dianne Russell", email: "dianne@gmail.com", address: "2464 Royal Ln.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
  { orderId: "#22112", memberName: "Kristin Watson", email: "kristin@gmail.com", address: "4517 Washington Ave.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Cancel" },
  { orderId: "#22113", memberName: "Ralph Edwards", email: "ralph@gmail.com", address: "2860 Pennington Dr.", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
  { orderId: "#22114", memberName: "Savannah Nguyen", email: "savannah@gmail.com", address: "2464 Oak Ridge", productName: "TX GT5 Motorized Treadmill", price: 200, status: "New" },
  { orderId: "#22115", memberName: "Jane Cooper", email: "jane@gmail.com", address: "1901 Thornridge", productName: "TX GT5 Motorized Treadmill", price: 200, status: "Delivered" },
];

const statusOptions: Array<"All" | OrderStatus> = ["All", "New", "Delivered", "Cancel"];

const statusStyles: Record<OrderStatus, string> = {
  New: "border-blue-200 bg-blue-100 text-blue-700",
  Delivered: "border-green-200 bg-green-100 text-green-700",
  Cancel: "border-red-200 bg-red-100 text-red-600",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>("All");
  const [page, setPage] = useState(1);

  const ordersQuery = useQuery({
    queryKey: ["orders-list"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return MOCK_ORDERS;
    },
  });

  const totalOrders = ordersQuery.data?.length ?? 0;
  const totalNew = ordersQuery.data?.filter((row) => row.status === "New").length ?? 0;
  const totalDelivered =
    ordersQuery.data?.filter((row) => row.status === "Delivered").length ?? 0;

  const filteredRows = useMemo(() => {
    const data = ordersQuery.data ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return data.filter((row) => {
      const statusMatch = selectedStatus === "All" ? true : row.status === selectedStatus;
      const searchMatch = normalizedSearch
        ? `${row.orderId} ${row.memberName} ${row.email} ${row.address} ${row.productName}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return statusMatch && searchMatch;
    });
  }, [ordersQuery.data, search, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4 pb-6">
      <div className="grid gap-3 lg:grid-cols-3">
        <StatCard title="Total Order" value={totalOrders} icon={Shapes} accent="red" />
        <StatCard title="New Order" value={totalNew} icon={Box} accent="blue" />
        <StatCard
          title="Total Delivered"
          value={totalDelivered}
          icon={PackageCheck}
          accent="green"
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_180px]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search"
                    className="pl-9"
                  />
                </div>
                <Button className="h-10 min-w-28">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>

              {ordersQuery.isLoading ? (
                <TableSkeleton rows={10} columns={8} />
              ) : paginatedRows.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Member Name</TableHead>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.map((row) => (
                        <TableRow key={row.orderId}>
                          <TableCell className="font-medium">{row.orderId}</TableCell>
                          <TableCell>{row.memberName}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.address}</TableCell>
                          <TableCell>{row.productName}</TableCell>
                          <TableCell>${row.price}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex min-w-[84px] items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold",
                                statusStyles[row.status],
                              )}
                            >
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                              aria-label={`Actions for ${row.orderId}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-zinc-500">
                      Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                      {Math.min(page * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} results
                    </p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                </>
              ) : (
                <EmptyState title="No orders found." description="Try another search or filter." />
              )}
            </div>

            <aside className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Filter</p>
                <div className="mt-2 space-y-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(status);
                        setPage(1);
                      }}
                      className={cn(
                        "block w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
                        selectedStatus === status
                          ? "bg-[#f8b400] text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Actions</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("Delivered")}
                    className="w-full rounded-md bg-[#f8b400] px-3 py-1.5 text-left text-xs font-medium text-white"
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
