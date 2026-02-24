"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { adminApi, type UserProfile } from "@/lib/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type MembershipType = "training" | "coaching" | "personal";

type MemberRow = {
  id: string;
  name: string;
  email: string;
  membershipType: MembershipType;
  joinDate: string;
  expiryDate: string;
};

const demoRows: MemberRow[] = [
  {
    id: "demo-1",
    name: "Courtney Henry",
    email: "tranthuy.nute@gmail.com",
    membershipType: "training",
    joinDate: "9/4/12",
    expiryDate: "7/18/17",
  },
  {
    id: "demo-2",
    name: "Wade Warren",
    email: "thuhang.nute@gmail.com",
    membershipType: "coaching",
    joinDate: "5/30/14",
    expiryDate: "11/7/16",
  },
  {
    id: "demo-3",
    name: "Guy Hawkins",
    email: "manhhachkt08@gmail.com",
    membershipType: "personal",
    joinDate: "6/19/14",
    expiryDate: "9/18/16",
  },
  {
    id: "demo-4",
    name: "Cody Fisher",
    email: "trungkienspktnd@gmail.com",
    membershipType: "personal",
    joinDate: "2/11/12",
    expiryDate: "3/4/16",
  },
  {
    id: "demo-5",
    name: "Eleanor Pena",
    email: "danghoang87hl@gmail.com",
    membershipType: "coaching",
    joinDate: "5/19/12",
    expiryDate: "1/31/14",
  },
  {
    id: "demo-6",
    name: "Robert Fox",
    email: "tienlapspktnd@gmail.com",
    membershipType: "personal",
    joinDate: "8/2/19",
    expiryDate: "1/28/17",
  },
  {
    id: "demo-7",
    name: "Jerome Bell",
    email: "nvt.isst.nute@gmail.com",
    membershipType: "training",
    joinDate: "7/27/13",
    expiryDate: "10/28/12",
  },
  {
    id: "demo-8",
    name: "Cameron",
    email: "vuhaithuongnute@gmail.com",
    membershipType: "personal",
    joinDate: "10/6/13",
    expiryDate: "5/27/15",
  },
  {
    id: "demo-9",
    name: "Esther Howard",
    email: "ckctm12@gmail.com",
    membershipType: "personal",
    joinDate: "8/16/13",
    expiryDate: "1/15/12",
  },
];

const membershipLabel: Record<MembershipType, string> = {
  training: "Training Plan",
  coaching: "Online Coaching",
  personal: "1 to 1 Training",
};

const membershipStyle: Record<MembershipType, string> = {
  training: "bg-[#ebb93f] text-white",
  coaching: "bg-[#c997ed] text-white",
  personal: "bg-[#3aa8e9] text-white",
};

const membershipCycle: MembershipType[] = [
  "training",
  "coaching",
  "personal",
  "personal",
  "coaching",
  "personal",
  "training",
  "personal",
  "personal",
  "coaching",
];

const formatShortDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(date);
};

const mapUsersToRows = (users: UserProfile[]): MemberRow[] => {
  return users.map((user, index) => {
    const fallbackJoin = new Date(2012, (index * 2) % 12, ((index * 3) % 26) + 1);
    const join = user.createdAt ? new Date(user.createdAt) : fallbackJoin;

    const safeJoin = Number.isNaN(join.getTime()) ? fallbackJoin : join;
    const expiry = new Date(safeJoin);
    expiry.setMonth(expiry.getMonth() + 12 + ((index % 4) + 1) * 3);

    return {
      id: user._id,
      name: user.name || "Unknown Member",
      email: user.email || "-",
      membershipType: membershipCycle[index % membershipCycle.length],
      joinDate: formatShortDate(safeJoin.toISOString()),
      expiryDate: formatShortDate(expiry.toISOString()),
    };
  });
};

const buildPaginationItems = (page: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, "dots", totalPages] as const;
  }

  if (page >= totalPages - 2) {
    return [1, "dots", totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "dots", page, "dots", totalPages] as const;
};

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({
    queryKey: ["membership-users"],
    queryFn: () => adminApi.getUsers({ page: 1, limit: 500 }),
  });

  const rows = useMemo(() => {
    const users = usersQuery.data?.users ?? [];
    if (!users.length) {
      return demoRows;
    }

    return mapUsersToRows(users);
  }, [usersQuery.data?.users]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }

    return rows.filter((row) => {
      return `${row.name} ${row.email}`.toLowerCase().includes(keyword);
    });
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="font-display text-3xl font-bold leading-[1.05] text-[#171717]">
          Memberships Dashboard
        </h2>
        <p className="mt-2 text-base text-[#464646]">
          View membership details, manage plans, and monitor usage seamlessly.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[835px]">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#9ea0a8]" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search"
            className="h-[58px] rounded-[12px] border-[#c9ccd4] bg-[#efefef] pl-14 pr-4 text-base text-[#2a2a2a] placeholder:text-[#999ca5] focus-visible:border-[#c9ccd4] focus-visible:ring-0"
          />
        </div>

        <Link
          href="/dashboard/subscriptions/plans"
          className="inline-flex h-[58px] shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#efb411] px-7 text-base font-medium text-white transition-colors hover:bg-[#dcaa16]"
        >
          <Plus className="h-6 w-6" />
          Manage Membership Plane
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead>
            <tr className="text-left text-lg font-semibold text-[#212121]">
              <th className="pb-4 pr-4">Member Name</th>
              <th className="pb-4 pr-4">Email Address</th>
              <th className="pb-4 pr-4">Membership Type</th>
              <th className="pb-4 pr-4">Join Date</th>
              <th className="pb-4">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  <td className="py-4 pr-4">
                    <div className="h-8 w-52 animate-pulse rounded bg-[#dddddd]" />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="h-8 w-72 animate-pulse rounded bg-[#dddddd]" />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="h-10 w-44 animate-pulse rounded-full bg-[#dddddd]" />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="h-8 w-24 animate-pulse rounded bg-[#dddddd]" />
                  </td>
                  <td className="py-4">
                    <div className="h-8 w-24 animate-pulse rounded bg-[#dddddd]" />
                  </td>
                </tr>
              ))
            ) : paginatedRows.length ? (
              paginatedRows.map((row) => (
                <tr key={row.id} className="text-base text-[#3a3a3a]">
                  <td className="py-[13px] pr-4 font-medium">{row.name}</td>
                  <td className="py-[13px] pr-4">{row.email}</td>
                  <td className="py-[13px] pr-4">
                    <span
                      className={cn(
                        "inline-flex min-h-[43px] items-center rounded-full px-4 text-sm font-medium",
                        membershipStyle[row.membershipType],
                      )}
                    >
                      {membershipLabel[row.membershipType]}
                    </span>
                  </td>
                  <td className="py-[13px] pr-4 font-medium">{row.joinDate}</td>
                  <td className="py-[13px] font-medium">{row.expiryDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-base text-[#7b7b7b]">
                  No memberships found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#6a6a6a]">
          Showing {filteredRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{" "}
          {Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}{" "}
          results
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#e2af17] text-[#b4b4b4] transition-colors enabled:hover:bg-[#f3e4b5] disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {paginationItems.map((item, index) => {
            if (item === "dots") {
              return (
                <span
                  key={`dots-${index}`}
                  className="inline-flex h-10 min-w-10 items-center justify-center rounded border border-[#e2af17] px-2 text-sm text-[#e2af17]"
                >
                  ...
                </span>
              );
            }

            const active = currentPage === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={cn(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded border px-2 text-sm transition-colors",
                  active
                    ? "border-[#e2af17] bg-[#e2af17] text-white"
                    : "border-[#e2af17] text-[#e2af17] hover:bg-[#f3e4b5]",
                )}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#e2af17] text-[#e2af17] transition-colors enabled:hover:bg-[#f3e4b5] disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}


