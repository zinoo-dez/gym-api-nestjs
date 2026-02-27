import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { goeyToast } from "goey-toast";

import {
    createSearchParamsFromReportsFilters,
    parseReportsFiltersFromSearchParams,
    type ExportFormat,
    type ReportActivityRow,
    type ReportsFilters,
} from "@/features/reports";
import {
    AttendancePatternChart,
    MembershipDistributionChart,
    RecentTransactionsTable,
    ReportsFilterBar,
    ReportsKpiCard,
    RevenueOverviewChart,
} from "@/components/features/reports";
import { useAttendanceOverviewQuery, useReportsSummaryQuery, useRevenueOverviewQuery } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/currency";
import { reportsService } from "@/services/reports.service";

const INTEGER_FORMATTER = new Intl.NumberFormat("en-US");

const formatInteger = (value: number): string => {
    return INTEGER_FORMATTER.format(Math.trunc(value));
};

const toErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null) {
        const candidate = error as {
            message?: string;
            response?: {
                data?: {
                    message?: string | string[];
                };
            };
        };

        const apiMessage = candidate.response?.data?.message;

        if (Array.isArray(apiMessage)) {
            return apiMessage.join(", ");
        }

        if (typeof apiMessage === "string" && apiMessage.length > 0) {
            return apiMessage;
        }

        if (typeof candidate.message === "string" && candidate.message.length > 0) {
            return candidate.message;
        }
    }

    return "Unable to load report data.";
};

const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

const sanitizeFilenameToken = (value: string): string => value.replace(/[^a-zA-Z0-9-_]/g, "_");

const createExportFilename = (filters: ReportsFilters, formatType: ExportFormat): string => {
    const start = sanitizeFilenameToken(filters.startDate);
    const end = sanitizeFilenameToken(filters.endDate);
    return `gym-report-${start}-to-${end}.${formatType}`;
};

const toCsvString = (rows: ReportActivityRow[]): string => {
    const headers = ["member", "action", "category", "amount", "status", "timestamp", "branch", "classCategory"];

    const escapeCell = (value: string): string => {
        if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
            return `"${value.replace(/"/g, "\"\"")}"`;
        }

        return value;
    };

    const lines = rows.map((row) => {
        const cells = [
            row.member,
            row.action,
            row.category,
            row.amount === null ? "" : row.amount.toString(),
            row.status,
            row.timestamp,
            row.branch ?? "",
            row.classCategory ?? "",
        ];

        return cells.map((cell) => escapeCell(cell)).join(",");
    });

    return [headers.join(","), ...lines].join("\n");
};

export function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

    const filters = useMemo(
        () => parseReportsFiltersFromSearchParams(searchParams),
        [searchParams],
    );

    const summaryQuery = useReportsSummaryQuery(filters);
    const revenueQuery = useRevenueOverviewQuery(filters);
    const attendanceQuery = useAttendanceOverviewQuery(filters);

    const summary = summaryQuery.data;

    const updateFilters = (nextFilters: ReportsFilters) => {
        setSearchParams(createSearchParamsFromReportsFilters(nextFilters));
    };

    const handleExport = async (formatType: ExportFormat) => {
        setExportingFormat(formatType);

        try {
            const blob = await reportsService.exportReport(filters, formatType);
            downloadBlob(blob, createExportFilename(filters, formatType));
            goeyToast.success(`${formatType.toUpperCase()} report downloaded.`);
            return;
        } catch (error) {
            if (formatType === "csv" && summary?.recentTransactions.length) {
                const csv = toCsvString(summary.recentTransactions);
                const fallbackBlob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                downloadBlob(fallbackBlob, createExportFilename(filters, "csv"));
                goeyToast.success("CSV export generated from visible table data.");
                return;
            }

            goeyToast.error(toErrorMessage(error));
        } finally {
            setExportingFormat(null);
        }
    };

    const summaryError = summaryQuery.isError ? toErrorMessage(summaryQuery.error) : undefined;
    const revenueError = revenueQuery.isError ? toErrorMessage(revenueQuery.error) : undefined;
    const attendanceError = attendanceQuery.isError ? toErrorMessage(attendanceQuery.error) : undefined;

    return (
        <div className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">Gym Analytics Dashboard</h1>
                <p className="text-base text-muted-foreground max-w-2xl">
                    Track revenue, memberships, attendance trends, and transaction activity in one responsive reporting view.
                </p>
            </header>

            <ReportsFilterBar
                filters={filters}
                branchOptions={summary?.branchOptions ?? []}
                classCategoryOptions={summary?.classCategoryOptions ?? []}
                onChange={updateFilters}
            />

            {summaryError ? (
                <div className="rounded-xl bg-destructive/10 p-4 text-destructive text-sm font-bold shadow-sm">
                    {summaryError}
                </div>
            ) : null}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ReportsKpiCard
                    title="Total Revenue"
                    valueLabel={formatCurrency(summary?.totalRevenue.value ?? 0)}
                    trendPercent={summary?.totalRevenue.changePercent ?? 0}
                    trendDirection={summary?.totalRevenue.trendDirection ?? "flat"}
                    helperText="from previous period"
                    icon="payments"
                    loading={summaryQuery.isPending && !summaryQuery.data}
                />
                <ReportsKpiCard
                    title="Active Members"
                    valueLabel={formatInteger(summary?.activeMembers.value ?? 0)}
                    trendPercent={summary?.activeMembers.changePercent ?? 0}
                    trendDirection={summary?.activeMembers.trendDirection ?? "flat"}
                    helperText="from previous period"
                    icon="group"
                    loading={summaryQuery.isPending && !summaryQuery.data}
                />
                <ReportsKpiCard
                    title="Today's Attendance"
                    valueLabel={formatInteger(summary?.todayAttendance.value ?? 0)}
                    trendPercent={summary?.todayAttendance.changePercent ?? 0}
                    trendDirection={summary?.todayAttendance.trendDirection ?? "flat"}
                    helperText="from previous period"
                    icon="event_available"
                    loading={summaryQuery.isPending && !summaryQuery.data}
                />
                <ReportsKpiCard
                    title="New Signups (This Month)"
                    valueLabel={formatInteger(summary?.newSignups.value ?? 0)}
                    trendPercent={summary?.newSignups.changePercent ?? 0}
                    trendDirection={summary?.newSignups.trendDirection ?? "flat"}
                    helperText="from previous period"
                    icon="person_add"
                    loading={summaryQuery.isPending && !summaryQuery.data}
                />
            </section>

            <section className="grid gap-4 lg:grid-cols-7">
                <RevenueOverviewChart
                    data={revenueQuery.data ?? []}
                    period={filters.period}
                    loading={revenueQuery.isPending && !revenueQuery.data}
                    errorMessage={revenueError}
                />
                <MembershipDistributionChart
                    data={summary?.membershipDistribution ?? []}
                    loading={summaryQuery.isPending && !summaryQuery.data}
                    errorMessage={summaryError}
                />
            </section>

            <section className="grid gap-4 lg:grid-cols-7">
                <AttendancePatternChart
                    peakHours={attendanceQuery.data?.peakHours ?? []}
                    peakDays={attendanceQuery.data?.peakDays ?? []}
                    loading={attendanceQuery.isPending && !attendanceQuery.data}
                    errorMessage={attendanceError}
                />

                <div className="lg:col-span-4">
                    <RecentTransactionsTable
                        rows={summary?.recentTransactions ?? []}
                        loading={summaryQuery.isPending && !summaryQuery.data}
                        exportingFormat={exportingFormat}
                        onExport={(formatType) => {
                            void handleExport(formatType);
                        }}
                        errorMessage={summaryError}
                    />
                </div>
            </section>
        </div>
    );
}
