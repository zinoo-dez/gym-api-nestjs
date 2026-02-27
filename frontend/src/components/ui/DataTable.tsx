import { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ────────────────────── Column definition ────────────────────── */

export interface DataTableColumn<T> {
    id: string;
    label: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    className?: string;
    headerClassName?: string;
    /** Override the default header cell content (label / sort button) */
    headerRender?: () => ReactNode;
    render: (row: T, index: number) => ReactNode;
}

/* ────────────────────── Props ────────────────────── */

export interface DataTableProps<T> {
    /** Column definitions */
    columns: DataTableColumn<T>[];
    /** Data rows */
    rows: T[];
    /** Unique key extractor for each row */
    rowKey: (row: T) => string;
    /** Row click handler — adds cursor-pointer + hover highlight */
    onRowClick?: (row: T) => void;

    /* ── Sorting ── */
    sortField?: string;
    sortDirection?: "asc" | "desc";
    onSortChange?: (field: string) => void;

    /* ── Empty state ── */
    emptyIcon?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;

    /* ── Loading / error ── */
    isLoading?: boolean;
    skeletonRows?: number;

    /* ── Pagination ── */
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;

    /* ── Mobile ── */
    mobileCard?: (row: T) => ReactNode;

    /* ── Styling ── */
    className?: string;
    stickyHeader?: boolean;
    striped?: boolean;
    minWidth?: string;
}

/* ────────────────────── Component ────────────────────── */

export function DataTable<T>({
    columns,
    rows,
    rowKey,
    onRowClick,
    sortField,
    sortDirection,
    onSortChange,
    emptyIcon,
    emptyTitle = "No data",
    emptyDescription,
    isLoading = false,
    skeletonRows = 5,
    page,
    totalPages,
    onPageChange,
    mobileCard,
    className,
    stickyHeader = false,
    striped = false,
    minWidth,
}: DataTableProps<T>) {
    const isEmpty = rows.length === 0 && !isLoading;

    /* ── Skeleton rows while loading ── */
    const renderSkeletonRows = () =>
        Array.from({ length: skeletonRows }).map((_, i) => (
            <TableRow key={`skel-${i}`} className="border-b last:border-0">
                {columns.map((col) => (
                    <TableCell key={col.id} className="px-4 py-3">
                        <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                ))}
            </TableRow>
        ));

    /* ── Empty state ── */
    const renderEmptyState = () => (
        <TableRow>
            <TableCell colSpan={columns.length} className="h-40 text-center">
                <div className="flex flex-col items-center gap-2 py-8">
                    {emptyIcon}
                    <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
                    {emptyDescription && (
                        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );

    /* ── Sortable header cell ── */
    const renderHeaderCell = (col: DataTableColumn<T>) => {
        const alignClass =
            col.align === "right"
                ? "text-right"
                : col.align === "center"
                    ? "text-center"
                    : "text-left";
        const sortable = Boolean(col.sortable && onSortChange);
        const isActive = sortField === col.id;

        return (
            <TableHead
                key={col.id}
                className={cn(
                    "px-4 py-3 font-medium text-muted-foreground",
                    alignClass,
                    stickyHeader && "sticky top-0 z-10 bg-muted/30 backdrop-blur-sm",
                    col.headerClassName,
                )}
            >
                {col.headerRender ? (
                    col.headerRender()
                ) : sortable ? (
                    <button
                        type="button"
                        onClick={() => onSortChange?.(col.id)}
                        className={cn(
                            "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                            col.align === "right" && "ml-auto",
                            col.align === "center" && "mx-auto",
                        )}
                    >
                        {col.label}
                        <ArrowUpDown
                            className={cn(
                                "size-3.5",
                                isActive ? "text-foreground" : "text-muted-foreground/50",
                            )}
                        />
                        {isActive && (
                            <span className="sr-only">
                                Sorted {sortDirection === "asc" ? "ascending" : "descending"}
                            </span>
                        )}
                    </button>
                ) : (
                    <span className="text-sm">{col.label}</span>
                )}
            </TableHead>
        );
    };

    /* ── Pagination bar ── */
    const renderPagination = () => {
        if (!onPageChange || !totalPages || totalPages <= 1) return null;
        const currentPage = page ?? 1;

        return (
            <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* ── Desktop table ── */}
            <div
                className={cn(
                    "overflow-x-auto rounded-lg border bg-card",
                    mobileCard ? "hidden md:block" : "",
                    className,
                )}
            >
                <Table className={cn(minWidth && `min-w-[${minWidth}]`)}>
                    <TableHeader>
                        <TableRow className="border-b bg-muted/20 hover:bg-muted/20">
                            {columns.map(renderHeaderCell)}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading
                            ? renderSkeletonRows()
                            : isEmpty
                                ? renderEmptyState()
                                : rows.map((row, index) => (
                                    <TableRow
                                        key={rowKey(row)}
                                        className={cn(
                                            "group border-b transition-colors last:border-0",
                                            onRowClick
                                                ? "cursor-pointer hover:bg-muted/50"
                                                : "hover:bg-muted/30",
                                            striped && index % 2 === 1 && "bg-muted/10",
                                        )}
                                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    >
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.id}
                                                className={cn(
                                                    "px-4 py-3 align-top",
                                                    col.align === "right"
                                                        ? "text-right"
                                                        : col.align === "center"
                                                            ? "text-center"
                                                            : "text-left",
                                                    col.className,
                                                )}
                                            >
                                                {col.render(row, index)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>

                {renderPagination()}
            </div>

            {/* ── Mobile cards ── */}
            {mobileCard && (
                <div className="space-y-3 md:hidden">
                    {isLoading ? (
                        Array.from({ length: skeletonRows }).map((_, i) => (
                            <div key={`mskel-${i}`} className="rounded-lg border bg-card p-4">
                                <Skeleton className="mb-2 h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))
                    ) : isEmpty ? (
                        <article className="rounded-lg border bg-card p-5 text-center shadow-sm">
                            {emptyIcon}
                            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
                            {emptyDescription && (
                                <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
                            )}
                        </article>
                    ) : (
                        rows.map((row) => (
                            <div
                                key={rowKey(row)}
                                className={cn(onRowClick && "cursor-pointer")}
                                onClick={
                                    onRowClick
                                        ? (event) => {
                                            const target = event.target as HTMLElement;
                                            if (
                                                target.closest(
                                                    "button, a, input, select, textarea, [role='button']",
                                                )
                                            ) {
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

                    {/* Mobile pagination */}
                    {renderPagination()}
                </div>
            )}
        </>
    );
}
