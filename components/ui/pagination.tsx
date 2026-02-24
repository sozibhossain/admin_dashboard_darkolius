import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const getPageItems = (currentPage: number, totalPages: number) => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return pages;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const items = getPageItems(page, safeTotalPages);

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      {items.map((item) => (
        <Button
          key={item}
          size="sm"
          variant={item === page ? "default" : "secondary"}
          onClick={() => onPageChange(item)}
        >
          {item}
        </Button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= safeTotalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
