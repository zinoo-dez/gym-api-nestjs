import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useNavigate, useParams } from "react-router-dom";

import {
    CostFilterState,
    CostFormValues,
    CostQuickFilter,
    CostRecord,
    CostSectionView,
    CostSortState,
    applyCostFilters,
    applyCostQuickFilter,
    buildCostByCategoryBreakdown,
    buildFixedVsVariableComparison,
    buildFutureCostProjection,
    buildMonthlyCostTrend,
    buildRecurringCostTracker,
    buildUpcomingDueCosts,
    buildVendorSpendSummary,
    calculateCostMetrics,
    calculateCostPaymentMetrics,
    getCostFormValuesFromRecord,
    getDefaultCostFilterState,
    getDefaultCostFormValues,
    getDuplicateCostFormValues,
    formatCurrency,
    formatDisplayDate,
    sortCostRecords,
    summarizeFutureProjection,
} from "@/features/costs";
import { CostAnalysisCharts } from "@/components/features/costs/CostAnalysisCharts";
import { CostDetailDrawer } from "@/components/features/costs/CostDetailDrawer";
import { CostFilters } from "@/components/features/costs/CostFilters";
import { CostFormDrawer } from "@/components/features/costs/CostFormDrawer";
import { CostOverviewKpis } from "@/components/features/costs/CostOverviewKpis";
import { CostPaymentHealthCards } from "@/components/features/costs/CostPaymentHealthCards";
import { CostPaymentStatusBadge } from "@/components/features/costs/CostPaymentStatusBadge";
import { CostRecurringTracker } from "@/components/features/costs/CostRecurringTracker";
import { CostTable } from "@/components/features/costs/CostTable";
import { CostVendorSummary } from "@/components/features/costs/CostVendorSummary";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { costService } from "@/services/cost.service";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/api-error";

type LoadState = "loading" | "error" | "ready";

const COST_SECTION_IDS: CostSectionView[] = [
    "overview",
    "analysis",
    "records",
    "recurring",
    "vendors",
];

const SECTION_CONFIG: Record<CostSectionView, { title: string }> = {
    overview: {
        title: "Cost Overview",

    },
    analysis: {
        title: "Cost Analysis",
    },
    records: {
        title: "Cost Records",
    },
    recurring: {
        title: "Recurring Tracker",
    },
    vendors: {
        title: "Vendor Spend",
    },
};

const toErrorMessage = (error: unknown) =>
    getApiErrorMessage(error, "Unable to complete cost request.");

const isCostSectionView = (value: string): value is CostSectionView => {
    return COST_SECTION_IDS.includes(value as CostSectionView);
};

export function CostManagementPage() {
    const user = useAuthStore((state) => state.user);
    const isMobile = useIsMobile();
    const { section } = useParams<{ section?: string }>();
    const navigate = useNavigate();

    const operator = useMemo(() => {
        const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
        return fullName || "Admin";
    }, [user?.firstName, user?.lastName]);

    const activeSection = useMemo<CostSectionView>(() => {
        if (section && isCostSectionView(section)) {
            return section;
        }

        return "overview";
    }, [section]);

    useEffect(() => {
        if (!section || isCostSectionView(section)) {
            return;
        }

        navigate("/app/finance/costs/overview", { replace: true });
    }, [navigate, section]);

    const defaultFilters = useMemo<CostFilterState>(() => getDefaultCostFilterState(), []);

    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [costs, setCosts] = useState<CostRecord[]>([]);
    const [actionError, setActionError] = useState<string | null>(null);

    const [filters, setFilters] = useState<CostFilterState>(defaultFilters);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [quickFilter, setQuickFilter] = useState<CostQuickFilter>("none");
    const [sortState, setSortState] = useState<CostSortState>({
        field: "costDate",
        direction: "desc",
    });

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedCost, setSelectedCost] = useState<CostRecord | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [formInitialValues, setFormInitialValues] = useState<CostFormValues>(
        getDefaultCostFormValues(operator),
    );
    const [editingCostId, setEditingCostId] = useState<string | null>(null);

    const loadCosts = useCallback(async () => {
        setLoadState("loading");

        try {
            const records = await costService.listCosts();
            setCosts(records);
            setActionError(null);
            setLoadState("ready");
        } catch (error) {
            console.error("Failed to load costs", error);
            setActionError(toErrorMessage(error));
            setLoadState("error");
        }
    }, []);

    useEffect(() => {
        void loadCosts();
    }, [loadCosts]);

    useEffect(() => {
        if (!formOpen && formMode === "add") {
            setFormInitialValues(getDefaultCostFormValues(operator));
        }
    }, [formMode, formOpen, operator]);

    const metrics = useMemo(() => calculateCostMetrics(costs), [costs]);
    const paymentMetrics = useMemo(() => calculateCostPaymentMetrics(costs), [costs]);
    const monthlyTrend = useMemo(() => buildMonthlyCostTrend(costs), [costs]);
    const categoryBreakdown = useMemo(() => buildCostByCategoryBreakdown(costs), [costs]);
    const fixedVsVariable = useMemo(() => buildFixedVsVariableComparison(costs), [costs]);
    const projectionPoints = useMemo(() => buildFutureCostProjection(costs), [costs]);
    const projectionSummary = useMemo(
        () => summarizeFutureProjection(projectionPoints),
        [projectionPoints],
    );
    const recurringTrackItems = useMemo(() => buildRecurringCostTracker(costs), [costs]);
    const vendorSummary = useMemo(() => buildVendorSpendSummary(costs), [costs]);
    const upcomingDueCosts = useMemo(() => buildUpcomingDueCosts(costs), [costs]);

    const upsertCostRecord = useCallback((record: CostRecord) => {
        setCosts((previous) => {
            const exists = previous.some((item) => item.id === record.id);
            if (!exists) {
                return [record, ...previous];
            }

            return previous.map((item) => (item.id === record.id ? record : item));
        });

        setSelectedCost((current) => (current?.id === record.id ? record : current));
    }, []);

    const filteredCosts = useMemo(() => applyCostFilters(costs, filters), [costs, filters]);

    const quickFilteredCosts = useMemo(
        () => applyCostQuickFilter(filteredCosts, quickFilter, metrics.highestCostCategory),
        [filteredCosts, quickFilter, metrics.highestCostCategory],
    );

    const visibleCosts = useMemo(
        () => sortCostRecords(quickFilteredCosts, sortState),
        [quickFilteredCosts, sortState],
    );

    const hasActiveFilters =
        filters.search !== defaultFilters.search ||
        filters.category !== defaultFilters.category ||
        filters.costType !== defaultFilters.costType ||
        filters.paymentStatus !== defaultFilters.paymentStatus ||
        filters.status !== defaultFilters.status ||
        filters.dateFrom !== defaultFilters.dateFrom ||
        filters.dateTo !== defaultFilters.dateTo ||
        quickFilter !== "none";

    const handleSortChange = (field: CostSortState["field"]) => {
        setSortState((current) => {
            if (current.field === field) {
                return {
                    field,
                    direction: current.direction === "asc" ? "desc" : "asc",
                };
            }

            return {
                field,
                direction: "asc",
            };
        });
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        setQuickFilter("none");
    };

    const handleQuickFilterChange = (nextFilter: CostQuickFilter) => {
        setQuickFilter((current) => (current === nextFilter ? "none" : nextFilter));
    };

    const openAddForm = () => {
        setFormMode("add");
        setEditingCostId(null);
        setFormInitialValues(getDefaultCostFormValues(operator));
        setFormOpen(true);
    };

    const openEditForm = (record: CostRecord) => {
        setFormMode("edit");
        setEditingCostId(record.id);
        setFormInitialValues(getCostFormValuesFromRecord(record));
        setFormOpen(true);
    };

    const openDuplicateForm = (record: CostRecord) => {
        setFormMode("add");
        setEditingCostId(null);
        setFormInitialValues(getDuplicateCostFormValues(record, operator));
        setFormOpen(true);
    };

    const openDetail = (record: CostRecord) => {
        setSelectedCost(record);
        setDetailOpen(true);
    };

    const handleFormSubmit = async (values: CostFormValues) => {
        try {
            setActionError(null);

            if (formMode === "add") {
                const created = await costService.createCost(values, operator);
                upsertCostRecord(created);
                setFormOpen(false);
                setSelectedCost(created);
                setDetailOpen(true);
                return;
            }

            if (!editingCostId) {
                return;
            }

            const updated = await costService.updateCost(editingCostId, values, operator);
            upsertCostRecord(updated);
            setFormOpen(false);
        } catch (error) {
            console.error("Failed to save cost", error);
            setActionError(toErrorMessage(error));
        }
    };

    const handleArchiveToggle = async (record: CostRecord) => {
        try {
            setActionError(null);

            const updated =
                record.status === "active"
                    ? await costService.archiveCost(record.id, operator)
                    : await costService.restoreCost(record.id, operator);

            upsertCostRecord(updated);
        } catch (error) {
            console.error("Failed to update cost status", error);
            setActionError(toErrorMessage(error));
        }
    };

    const sectionMeta = SECTION_CONFIG[activeSection];

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Cost & Expense Tracking</h1>
                </div>
                <Button type="button" onClick={openAddForm} className="h-10 px-8 shadow-md">
                    <MaterialIcon icon="add" className="text-lg" />
                    <span>Add Cost</span>
                </Button>
            </header>

            {loadState === "loading" ? (
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">Loading cost records...</CardContent>
                </Card>
            ) : null}

            {loadState === "error" ? (
                <Card>
                    <CardContent className="flex flex-col gap-3 p-6">
                        <p className="text-sm text-destructive">Unable to load cost data.</p>
                        <div>
                            <Button type="button" variant="outline" onClick={() => void loadCosts()}>
                                <MaterialIcon icon="refresh" className="text-lg" />
                                <span>Retry</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {actionError ? (
                <Card>
                    <CardContent className="p-4 text-sm text-destructive">{actionError}</CardContent>
                </Card>
            ) : null}

            {loadState === "ready" ? (
                <div className="space-y-6">
                    <section>
                        <h2 className="text-lg font-bold text-foreground">{sectionMeta.title}</h2>
                    </section>

                    {activeSection === "overview" ? (
                        <>
                            <CostOverviewKpis
                                metrics={metrics}
                                activeFilter={quickFilter}
                                onFilterChange={handleQuickFilterChange}
                            />

                            <CostPaymentHealthCards metrics={paymentMetrics} />

                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold tracking-tight">Upcoming Due Costs (Next 14 Days)</h3>

                                {upcomingDueCosts.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-6 text-sm text-muted-foreground">
                                            No pending or overdue costs due in the next 14 days.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <DataTable<CostRecord>
                                        columns={[
                                            { id: "title", label: "Title", render: (cost) => <span className="text-foreground">{cost.title}</span> },
                                            { id: "vendor", label: "Vendor", render: (cost) => <span className="text-foreground">{cost.vendor || "-"}</span> },
                                            { id: "dueDate", label: "Due Date", render: (cost) => <span className="text-foreground">{formatDisplayDate(cost.dueDate)}</span> },
                                            { id: "paymentStatus", label: "Payment Status", render: (cost) => <CostPaymentStatusBadge status={cost.paymentStatus} /> },
                                        ] satisfies DataTableColumn<CostRecord>[]}
                                        rows={upcomingDueCosts.slice(0, 8)}
                                        rowKey={(cost) => cost.id}
                                        emptyTitle="No upcoming due costs"
                                    />
                                )}
                            </section>
                        </>
                    ) : null}

                    {activeSection === "analysis" ? (
                        <CostAnalysisCharts
                            monthlyTrend={monthlyTrend}
                            categoryBreakdown={categoryBreakdown}
                            fixedVsVariable={fixedVsVariable}
                            projectionPoints={projectionPoints}
                            projectionSummary={projectionSummary}
                        />
                    ) : null}

                    {activeSection === "records" ? (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold tracking-tight">Detailed Cost Records</h3>
                                <Button type="button" variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>
                                    Clear List Filters
                                </Button>
                            </div>

                            <CostFilters
                                filters={filters}
                                onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
                                onReset={clearFilters}
                                hasActiveFilters={hasActiveFilters}
                                mobileOpen={mobileFiltersOpen}
                                onMobileOpenChange={setMobileFiltersOpen}
                            />

                            {costs.length === 0 ? (
                                <Card>
                                    <CardContent className="space-y-3 p-8 text-center">
                                        <p className="text-base font-medium text-foreground">No costs recorded yet.</p>
                                        <p className="text-sm text-muted-foreground">
                                            Add your first operating cost to start financial tracking.
                                        </p>
                                        <div>
                                            <Button type="button" onClick={openAddForm} className="h-10 px-8 shadow-md">
                                                <MaterialIcon icon="add" className="text-lg" />
                                                <span>Add Cost</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {costs.length > 0 && visibleCosts.length === 0 ? (
                                <Card>
                                    <CardContent className="space-y-3 p-8 text-center">
                                        <p className="text-base font-medium text-foreground">No costs match current filters.</p>
                                        <p className="text-sm text-muted-foreground">
                                            Adjust filters or clear quick filters to review all records.
                                        </p>
                                        <div>
                                            <Button type="button" variant="outline" onClick={clearFilters}>
                                                Reset Filters
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {visibleCosts.length > 0 ? (
                                <CostTable
                                    costs={visibleCosts}
                                    sortField={sortState.field}
                                    sortDirection={sortState.direction}
                                    onSortChange={handleSortChange}
                                    onView={openDetail}
                                    onEdit={openEditForm}
                                    onArchiveToggle={(record) => {
                                        void handleArchiveToggle(record);
                                    }}
                                />
                            ) : null}
                        </section>
                    ) : null}

                    {activeSection === "recurring" ? (
                        <section className="space-y-4">
                            <Card>
                                <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <p className="meta-text">Recurring Cost Entries</p>
                                        <p className="text-2xl font-semibold tracking-tight text-foreground">
                                            {recurringTrackItems.length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="meta-text">Projected Next 12 Months</p>
                                        <p className="text-2xl font-semibold tracking-tight text-foreground">
                                            {formatCurrency(projectionSummary.nextYearTotal)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="meta-text">Average Monthly Projection</p>
                                        <p className="text-2xl font-semibold tracking-tight text-foreground">
                                            {formatCurrency(projectionSummary.averageMonthlyProjection)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <CostRecurringTracker items={recurringTrackItems} />
                        </section>
                    ) : null}

                    {activeSection === "vendors" ? (
                        <section className="space-y-4">
                            <Card>
                                <CardContent className="p-4 text-sm text-muted-foreground">
                                    Vendor summary helps detect concentration risk and late payment exposure.
                                </CardContent>
                            </Card>
                            <CostVendorSummary items={vendorSummary} />
                        </section>
                    ) : null}
                </div>
            ) : null}

            <CostDetailDrawer
                open={detailOpen}
                cost={selectedCost}
                isMobile={isMobile}
                onClose={() => setDetailOpen(false)}
                onEdit={(record) => {
                    setDetailOpen(false);
                    openEditForm(record);
                }}
                onArchiveToggle={(record) => {
                    void handleArchiveToggle(record);
                }}
                onDuplicate={(record) => {
                    setDetailOpen(false);
                    openDuplicateForm(record);
                }}
            />

            <CostFormDrawer
                open={formOpen}
                isMobile={isMobile}
                mode={formMode}
                initialValues={formInitialValues}
                onClose={() => setFormOpen(false)}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
