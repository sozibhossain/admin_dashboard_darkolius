"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attendanceApi, getApiErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const PER_PAGE = 12;

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [page, setPage] = useState(1);
  const [createForm, setCreateForm] = useState({
    userId: "",
    visitDate: "",
    entryTime: "",
    exitTime: "",
  });

  const query = useQuery({
    queryKey: ["attendance", month, year],
    queryFn: () => attendanceApi.getMine({ month, year }),
  });

  const createMutation = useMutation({
    mutationFn: attendanceApi.create,
    onSuccess: () => {
      toast.success("Attendance record created.");
      setCreateForm({ userId: "", visitDate: "", entryTime: "", exitTime: "" });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const details = useMemo(() => query.data?.dayDetails ?? [], [query.data?.dayDetails]);
  const totalPages = Math.max(1, Math.ceil(details.length / PER_PAGE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return details.slice(start, start + PER_PAGE);
  }, [details, page]);

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="Attendance"
        description="Monthly attendance analytics and manual attendance creation."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Visits"
          value={query.data?.totalVisits ?? 0}
          icon={CalendarClock}
          accent="blue"
        />
        <StatCard
          title="Average Stay (min)"
          value={query.data?.averageStayMinutes ?? 0}
          icon={CalendarClock}
          accent="green"
        />
        <StatCard
          title="Attended Days"
          value={query.data?.attendedDays?.length ?? 0}
          icon={CalendarClock}
          accent="yellow"
        />
        <StatCard
          title="Missed Days"
          value={query.data?.missedDays?.length ?? 0}
          icon={CalendarClock}
          accent="red"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={createForm.userId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, userId: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Input
                type="datetime-local"
                value={createForm.visitDate}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, visitDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Entry Time</Label>
              <Input
                type="datetime-local"
                value={createForm.entryTime}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, entryTime: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Exit Time</Label>
              <Input
                type="datetime-local"
                value={createForm.exitTime}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, exitTime: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (!createForm.userId.trim()) {
                  toast.error("User ID is required.");
                  return;
                }

                createMutation.mutate({
                  userId: createForm.userId,
                  visitDate: createForm.visitDate || undefined,
                  entryTime: createForm.entryTime || undefined,
                  exitTime: createForm.exitTime || undefined,
                });
              }}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Record
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label>Month</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              />
            </div>
          </div>

          {query.isLoading ? (
            <TableSkeleton rows={10} columns={4} />
          ) : paginatedRows.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Duration (minutes)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((item) => (
                    <TableRow key={item.date}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{formatDateTime(item.entryTime)}</TableCell>
                      <TableCell>{formatDateTime(item.exitTime)}</TableCell>
                      <TableCell>{item.durationMinutes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              title="No attendance records for this period."
              description="Change month/year or add records manually."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
