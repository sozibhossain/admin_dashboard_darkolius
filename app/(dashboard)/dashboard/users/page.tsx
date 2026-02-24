"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";

const LIMIT = 10;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const usersQuery = useQuery({
    queryKey: ["users", page, LIMIT],
    queryFn: () => adminApi.getUsers({ page, limit: LIMIT }),
    placeholderData: (previous) => previous,
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const totalPages = usersQuery.data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="User Management"
        description="Track all registered users and moderate account access."
      />

      <Card>
        <CardContent className="pt-4">
          {usersQuery.isLoading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : usersQuery.data?.users?.length ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.data.users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "warning" : "default"}>
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteUserMutation.isPending}
                          onClick={() => deleteUserMutation.mutate(user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : (
            <EmptyState title="No users available." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
