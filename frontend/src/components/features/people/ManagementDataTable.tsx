import { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ManagementDataTableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right";
  className?: string;
  render: (row: T) => ReactNode;
}

interface ManagementDataTableProps<T> {
  rows: T[];
  rowKey: (row: T) => string;
  columns: ManagementDataTableColumn<T>[];
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (field: string) => void;
  onRowClick?: (row: T) => void;
  mobileCard: (row: T) => ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
}

export function ManagementDataTable<T>({
  rows,
  rowKey,
  columns,
  sortField,
  sortDirection,
  onSortChange,
  onRowClick,
  mobileCard,
  emptyTitle,
  emptyDescription,
}: ManagementDataTableProps<T>) {
  const isEmpty = rows.length === 0;

  const renderDesktopEmptyState = () => (
    <tr>
      <td className="px-4 py-12 text-center" colSpan={columns.length}>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
          {emptyDescription ? <p className="text-sm text-muted-foreground">{emptyDescription}</p> : null}
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              {columns.map((column) => {
                const alignClass = column.align === "right" ? "text-right" : "text-left";
                const sortable = Boolean(column.sortable && onSortChange);
                const isActiveSort = sortField === column.id;

                return (
                  <th key={column.id} className={cn("px-4 py-3", alignClass, column.className)}>
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange?.(column.id)}
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                          column.align === "right" ? "ml-auto" : "",
                        )}
                      >
                        {column.label}
                        <ArrowUpDown
                          className={cn(
                            "size-3.5",
                            isActiveSort ? "text-foreground" : "text-muted-foreground",
                          )}
                        />
                        {isActiveSort ? (
                          <span className="sr-only">
                            Sorted {sortDirection === "asc" ? "ascending" : "descending"}
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">{column.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isEmpty
              ? renderDesktopEmptyState()
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className={cn(
                      "border-b transition-colors last:border-0",
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : "hover:bg-muted/30",
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "px-4 py-3 align-top",
                          column.align === "right" ? "text-right" : "text-left",
                          column.className,
                        )}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {isEmpty ? (
          <article className="rounded-lg border bg-card p-5 text-center shadow-sm">
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
            {emptyDescription ? <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p> : null}
          </article>
        ) : (
          rows.map((row) => (
            <div
              key={rowKey(row)}
              className={cn(onRowClick ? "cursor-pointer" : "")}
              onClick={
                onRowClick
                  ? (event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea, [role='button']")) {
                        return;
                      }
                      onRowClick(row);
                    }
                  : undefined
              }
            >
              {mobileCard(row)}
            </div>
          ))
        )}
      </div>
    </>
  );
}
