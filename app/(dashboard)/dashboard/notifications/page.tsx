"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, SendHorizonal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage, notificationApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const PER_PAGE = 8;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    userId: "",
    title: "Admin",
    message: "",
    details: "View details",
    heading: "ATTENTION MEMBERS:",
    bullet: "Update",
    body: "",
  });

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: notificationApi.create,
    onSuccess: () => {
      toast.success("Notification sent.");
      setForm((prev) => ({ ...prev, message: "", body: "" }));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationApi.delete,
    onSuccess: () => {
      toast.success("Notification removed.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
        title="Notifications"
        description="Broadcast announcements globally or to a specific user."
      />

      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>Target User ID (optional)</Label>
              <Input
                value={form.userId}
                onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <Input
                value={form.details}
                onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input
                value={form.heading}
                onChange={(event) => setForm((prev) => ({ ...prev, heading: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bullet</Label>
              <Input
                value={form.bullet}
                onChange={(event) => setForm((prev) => ({ ...prev, bullet: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2 xl:col-span-1">
              <Label>Message</Label>
              <Input
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2 xl:col-span-3">
              <Label>Body</Label>
              <Textarea
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (!form.message.trim()) {
                  toast.error("Message is required.");
                  return;
                }
                createMutation.mutate({
                  userId: form.userId || undefined,
                  title: form.title,
                  message: form.message,
                  details: form.details,
                  heading: form.heading,
                  bullet: form.bullet,
                  body: form.body,
                });
              }}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {query.isLoading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : paginatedRows.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.title || "Admin"}</TableCell>
                      <TableCell>{item.message}</TableCell>
                      <TableCell>
                        {typeof item.userId === "object" && item.userId
                          ? item.userId.email || item.userId._id
                          : item.userId || "Global"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isRead ? "success" : "warning"}>
                          {item.isRead ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No notifications yet." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
