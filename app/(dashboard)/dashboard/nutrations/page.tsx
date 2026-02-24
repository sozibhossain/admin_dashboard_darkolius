"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
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
import { getApiErrorMessage, nutrationApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const PER_PAGE = 10;

export default function NutrationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    name: "",
    meal: "",
    protein: "",
    carbs: "",
    fat: "",
    cal: "",
    date: "",
  });

  const query = useQuery({
    queryKey: ["nutrations"],
    queryFn: nutrationApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: nutrationApi.create,
    onSuccess: () => {
      toast.success("Nutrition log added.");
      setForm({
        name: "",
        meal: "",
        protein: "",
        carbs: "",
        fat: "",
        cal: "",
        date: "",
      });
      queryClient.invalidateQueries({ queryKey: ["nutrations"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return rows.slice(start, start + PER_PAGE);
  }, [page, rows]);

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="Nutrition Logs"
        description="Track meal plans and macro entries submitted by users."
      />

      <Card>
        <CardHeader>
          <CardTitle>Create Nutrition Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Meal</Label>
              <Input
                value={form.meal}
                onChange={(event) => setForm((prev) => ({ ...prev, meal: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Protein</Label>
              <Input
                value={form.protein}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, protein: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Carbs</Label>
              <Input
                value={form.carbs}
                onChange={(event) => setForm((prev) => ({ ...prev, carbs: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fat</Label>
              <Input
                value={form.fat}
                onChange={(event) => setForm((prev) => ({ ...prev, fat: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input
                value={form.cal}
                onChange={(event) => setForm((prev) => ({ ...prev, cal: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (!form.name || !form.date) {
                  toast.error("Name and date are required.");
                  return;
                }

                createMutation.mutate({
                  name: form.name,
                  meal: form.meal,
                  protein: form.protein,
                  carbs: form.carbs,
                  fat: form.fat,
                  cal: form.cal,
                  date: form.date,
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
                  Add Entry
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Nutrition Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {query.isLoading ? (
            <TableSkeleton rows={8} columns={8} />
          ) : paginatedRows.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Protein</TableHead>
                    <TableHead>Carbs</TableHead>
                    <TableHead>Fat</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>
                        {typeof entry.userId === "object"
                          ? entry.userId?.email || entry.userId?.name || "-"
                          : entry.userId || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{entry.name || "-"}</TableCell>
                      <TableCell>{entry.meal || "-"}</TableCell>
                      <TableCell>{entry.protein || "-"}</TableCell>
                      <TableCell>{entry.carbs || "-"}</TableCell>
                      <TableCell>{entry.fat || "-"}</TableCell>
                      <TableCell>{entry.cal || "-"}</TableCell>
                      <TableCell>{formatDateTime(entry.date || entry.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No nutrition entries found." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
