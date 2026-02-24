"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { adminApi, nutrationApi, trainingApi, type UserProfile } from "@/lib/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const formatJoinDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(date);
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

export default function TrainingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({
    queryKey: ["training-members"],
    queryFn: () => adminApi.getUsers({ page: 1, limit: 500 }),
  });

  const trainingQuery = useQuery({
    queryKey: ["training-plans-status"],
    queryFn: trainingApi.getAll,
  });

  const nutritionQuery = useQuery({
    queryKey: ["nutrition-plans-status"],
    queryFn: nutrationApi.getAll,
  });

  const planUserIds = useMemo(() => {
    const ids = new Set<string>();

    for (const row of trainingQuery.data ?? []) {
      const userId = typeof row.userId === "object" ? row.userId?._id : row.userId;
      if (userId) ids.add(String(userId));
    }

    for (const row of nutritionQuery.data ?? []) {
      const userId = typeof row.userId === "object" ? row.userId?._id : row.userId;
      if (userId) ids.add(String(userId));
    }

    return ids;
  }, [nutritionQuery.data, trainingQuery.data]);

  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data?.users]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      return `${user._id} ${user.name ?? ""} ${user.email ?? ""}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  const loading =
    usersQuery.isLoading || trainingQuery.isLoading || nutritionQuery.isLoading;

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="font-display text-3xl font-bold leading-[1.05] text-[#171717]">
          Diet and workout plans
        </h2>
        <p className="mt-2 text-base text-[#464646]">
          Send personalized diet and workout plans to your members from one place.
        </p>
      </div>

      <div className="relative w-full">
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead>
            <tr className="text-left text-lg font-semibold text-[#212121]">
              <th className="pb-4 pr-4">Member ID</th>
              <th className="pb-4 pr-4">Member Name</th>
              <th className="pb-4 pr-4">Email Address</th>
              <th className="pb-4 pr-4">Join Date</th>
              <th className="pb-4 pr-4">Plan Status</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  {Array.from({ length: 6 }).map((__, col) => (
                    <td key={`${index}-${col}`} className="py-4 pr-4">
                      <div className="h-8 w-full max-w-40 animate-pulse rounded bg-[#dddddd]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedRows.length ? (
              paginatedRows.map((user: UserProfile) => {
                const hasPlan = planUserIds.has(String(user._id));
                const status = hasPlan ? "Send" : "N/A";

                return (
                  <tr
                    key={user._id}
                    className="text-base text-[#3a3a3a]"
                  >
                    <td className="py-[13px] pr-4 font-medium">{String(user._id).slice(-7)}</td>
                    <td className="py-[13px] pr-4 font-medium">{user.name || "Unknown Member"}</td>
                    <td className="py-[13px] pr-4">{user.email || "-"}</td>
                    <td className="py-[13px] pr-4 font-medium">{formatJoinDate(user.createdAt)}</td>
                    <td className="py-[13px] pr-4">
                      <span
                        className={cn(
                          "inline-flex min-h-[43px] min-w-[108px] items-center justify-center rounded-full px-4 text-sm font-medium",
                          hasPlan
                            ? "bg-[#c9e8d3] text-[#02843f]"
                            : "bg-[#efc8ca] text-[#e50707]",
                        )}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-[13px]">
                      <Link
                        href={`/dashboard/trainings/${user._id}`}
                        className="inline-flex min-h-[37px] items-center justify-center rounded-[10px] bg-[#efb411] px-3 text-xs font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-colors hover:bg-[#dcaa16]"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-base text-[#7b7b7b]">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#6a6a6a]">
          Showing {filteredRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{" "}
          {Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} results
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

