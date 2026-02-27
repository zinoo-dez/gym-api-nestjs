import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

import {
  EquipmentFilterState,
  EquipmentFormValues,
  EquipmentRecord,
  EquipmentSortField,
  MaintenanceLogFormValues,
  SortDirection,
  calculateEquipmentMetrics,
  formatCurrency,
  getDefaultFormValues,
  getFormValuesFromEquipment,
} from "@/features/equipment";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EquipmentDetailDrawer } from "@/components/features/equipment/EquipmentDetailDrawer";
import { EquipmentFilters } from "@/components/features/equipment/EquipmentFilters";
import { EquipmentFormDrawer } from "@/components/features/equipment/EquipmentFormDrawer";
import { EquipmentTable } from "@/components/features/equipment/EquipmentTable";
import { MaintenanceLogDrawer } from "@/components/features/equipment/MaintenanceLogDrawer";
import { useAuthStore } from "@/store/auth.store";
import { equipmentService } from "@/services/equipment.service";

const DEFAULT_FILTERS: EquipmentFilterState = {
  search: "",
  condition: "all",
  category: "all",
  maintenanceDue: "all",
};

type LoadState = "loading" | "error" | "ready";

type QuickFilter = "all" | "active" | "needs_maintenance" | "out_of_order" | "upcoming_30";
type EquipmentViewMode = "overview" | "list" | "all";

interface SortState {
  field: EquipmentSortField;
  direction: SortDirection;
}

const QUICK_FILTER_VALUES: QuickFilter[] = [
  "all",
  "active",
  "needs_maintenance",
  "out_of_order",
  "upcoming_30",
];

const toErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const errorWithMessage = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const apiMessage = errorWithMessage.response?.data?.message;
    if (Array.isArray(apiMessage)) {
      return apiMessage.join(", ");
    }

    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }

    if (typeof errorWithMessage.message === "string" && errorWithMessage.message.length > 0) {
      return errorWithMessage.message;
    }
  }

  return "Unable to complete equipment request.";
};

interface StatCardProps {
  title: string;
  value: string | number;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  active: boolean;
  onClick: () => void;
  helperText?: string;
  icon: string;
}

const TONE_STYLES: Record<StatCardProps["tone"], string> = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
  info: "text-primary bg-primary/10",
};

function StatCard({
  title,
  value,
  tone,
  active,
  onClick,
  helperText,
  icon,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-200",
        active 
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary" 
          : "border-border bg-card hover:bg-card hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </p>
          <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
          {helperText ? (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          ) : null}
        </div>
        <span className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105", 
          TONE_STYLES[tone]
        )}>
          <MaterialIcon icon={icon} className="text-2xl" />
        </span>
      </div>
      
      {active && (
        <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary shadow-sm">
          <MaterialIcon icon="check" className="text-primary-foreground text-sm" weight={700} opticalSize={16} />
        </div>
      )}
    </button>
  );
}

interface EquipmentManagementPageProps {
  view?: EquipmentViewMode;
}

export function EquipmentManagementPage({ view = "all" }: EquipmentManagementPageProps) {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isOverviewPage = view === "overview";
  const isListPage = view === "list";
  const showOverviewSection = view !== "list";
  const showListSection = view !== "overview";

  const quickFilterFromQuery = useMemo<QuickFilter>(() => {
    if (!isListPage) {
      return "all";
    }

    const value = searchParams.get("quickFilter");
    if (!value) {
      return "all";
    }

    return QUICK_FILTER_VALUES.includes(value as QuickFilter)
      ? (value as QuickFilter)
      : "all";
  }, [isListPage, searchParams]);

  const pageFromQuery = useMemo(() => {
    if (!isListPage) {
      return 1;
    }

    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [isListPage, searchParams]);

  const pageSizeFromQuery = useMemo(() => {
    if (!isListPage) {
      return 20;
    }

    const raw = Number(searchParams.get("limit") ?? "20");
    if (!Number.isFinite(raw) || raw <= 0) {
      return 20;
    }

    return Math.min(100, Math.floor(raw));
  }, [isListPage, searchParams]);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EquipmentFilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(
    isListPage ? quickFilterFromQuery : "all",
  );
  const [sort, setSort] = useState<SortState>({
    field: "name",
    direction: "asc",
  });
  const [page, setPage] = useState(isListPage ? pageFromQuery : 1);
  const [pageSize, setPageSize] = useState(isListPage ? pageSizeFromQuery : 20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentRecord | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formInitialValues, setFormInitialValues] = useState<EquipmentFormValues>(
    getDefaultFormValues(),
  );
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const [logOpen, setLogOpen] = useState(false);
  const [logTargetEquipment, setLogTargetEquipment] = useState<EquipmentRecord | null>(null);

  const operator = useMemo(() => {
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return fullName || "Admin";
  }, [user?.firstName, user?.lastName]);

  const loadEquipment = useCallback(async () => {
    setLoadState("loading");

    try {
      const quickFilterToApi = (): Partial<{
        condition: EquipmentFilterState["condition"];
        maintenanceDue: EquipmentFilterState["maintenanceDue"];
        isActive: boolean;
      }> => {
        switch (quickFilter) {
          case "active":
            return { isActive: true };
          case "needs_maintenance":
            return { condition: "needs_maintenance" };
          case "out_of_order":
            return { condition: "out_of_order" };
          case "upcoming_30":
            return { maintenanceDue: "next_30_days" };
          default:
            return {};
        }
      };

      const result = await equipmentService.listEquipmentPaginated({
        search: filters.search,
        category: filters.category,
        condition: quickFilterToApi().condition ?? filters.condition,
        maintenanceDue: quickFilterToApi().maintenanceDue ?? filters.maintenanceDue,
        isActive:
          quickFilterToApi().isActive !== undefined
            ? quickFilterToApi().isActive
            : undefined,
        sortField: sort.field,
        sortDirection: sort.direction,
        page,
        limit: pageSize,
      });

      setEquipment(result.data);
      setTotalItems(result.total);
      setTotalPages(result.totalPages);
      setActionError(null);
      setLoadState("ready");
    } catch (error) {
      console.error("Failed to load equipment records", error);
      setActionError(toErrorMessage(error));
      setLoadState("error");
    }
  }, [filters, page, pageSize, quickFilter, sort.direction, sort.field]);

  useEffect(() => {
    void loadEquipment();
  }, [loadEquipment]);

  useEffect(() => {
    if (isListPage) {
      setQuickFilter(quickFilterFromQuery);
      setPage(pageFromQuery);
      setPageSize(pageSizeFromQuery);
    }
  }, [isListPage, pageFromQuery, pageSizeFromQuery, quickFilterFromQuery]);

  useEffect(() => {
    if (!isListPage) {
      return;
    }

    const next = new URLSearchParams(searchParams);

    if (quickFilter === "all") {
      next.delete("quickFilter");
    } else {
      next.set("quickFilter", quickFilter);
    }

    if (page <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(page));
    }

    if (pageSize === 20) {
      next.delete("limit");
    } else {
      next.set("limit", String(pageSize));
    }

    const currentQuery = searchParams.toString();
    const nextQuery = next.toString();
    if (nextQuery !== currentQuery) {
      setSearchParams(next, { replace: true });
    }
  }, [isListPage, page, pageSize, quickFilter, searchParams, setSearchParams]);

  const metrics = useMemo(() => calculateEquipmentMetrics(equipment), [equipment]);

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.category !== "all" ||
    filters.condition !== "all" ||
    filters.maintenanceDue !== "all" ||
    quickFilter !== "all";

  const handleSortChange = (field: EquipmentSortField) => {
    setPage(1);
    setSort((current) => {
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
    setFilters(DEFAULT_FILTERS);
    setQuickFilter("all");
    setPage(1);

    if (isListPage) {
      navigate("/management/equipment/list", { replace: true });
    }
  };

  const handleOverviewCardClick = (filter: QuickFilter) => {
    if (isOverviewPage) {
      const query = filter === "all" ? "" : `?quickFilter=${filter}`;
      navigate(`/management/equipment/list${query}`);
      return;
    }

    setQuickFilter(filter);
    setPage(1);
  };

  const pageTitle =
    view === "overview"
      ? "Equipment Overview"
      : view === "list"
        ? "Equipment List"
        : "Equipment Management";

  const pageDescription =
    view === "overview"
      ? "Monitor equipment health, maintenance demand, and total asset value."
      : view === "list"
        ? "Manage equipment records, filters, and maintenance actions."
        : "Track gym assets, maintenance schedules, and equipment lifecycle costs.";

  const openAddForm = () => {
    setFormMode("add");
    setEditingEquipmentId(null);
    setFormInitialValues(getDefaultFormValues());
    setFormOpen(true);
  };

  const openEditForm = (record: EquipmentRecord) => {
    setFormMode("edit");
    setEditingEquipmentId(record.id);
    setFormInitialValues(getFormValuesFromEquipment(record));
    setFormOpen(true);
  };

  const openDetail = (record: EquipmentRecord) => {
    setSelectedEquipment(record);
    setDetailOpen(true);
  };

  const openMaintenanceLog = (record: EquipmentRecord) => {
    setLogTargetEquipment(record);
    setLogOpen(true);
  };

  const handleFormSubmit = async (values: EquipmentFormValues) => {
    try {
      setActionError(null);

      if (formMode === "add") {
        const created = await equipmentService.createEquipment(values);
        await loadEquipment();
        setFormOpen(false);
        setSelectedEquipment(created);
        setDetailOpen(true);
        return;
      }

      if (!editingEquipmentId) {
        return;
      }

      const updated = await equipmentService.updateEquipment(editingEquipmentId, values);
      await loadEquipment();
      setSelectedEquipment((current) => (current?.id === updated.id ? updated : current));
      setFormOpen(false);
    } catch (error) {
      console.error("Failed to save equipment", error);
      setActionError(toErrorMessage(error));
    }
  };

  const handleLogSubmit = async (values: MaintenanceLogFormValues) => {
    if (!logTargetEquipment) {
      return;
    }

    try {
      setActionError(null);
      const updated = await equipmentService.logMaintenance(
        logTargetEquipment.id,
        values,
        operator,
      );
      await loadEquipment();
      setSelectedEquipment((current) => (current?.id === updated.id ? updated : current));
      setLogOpen(false);
    } catch (error) {
      console.error("Failed to log equipment maintenance", error);
      setActionError(toErrorMessage(error));
    }
  };

  const handleMarkOutOfOrder = async (record: EquipmentRecord) => {
    try {
      setActionError(null);
      const updated = await equipmentService.markOutOfOrder(record.id);
      await loadEquipment();
      setSelectedEquipment((current) => (current?.id === updated.id ? updated : current));
    } catch (error) {
      console.error("Failed to mark equipment out of order", error);
      setActionError(toErrorMessage(error));
    }
  };

  const handleRetireEquipment = async (record: EquipmentRecord) => {
    try {
      setActionError(null);
      const updated = await equipmentService.retireEquipment(record.id);
      await loadEquipment();
      setSelectedEquipment((current) => (current?.id === updated.id ? updated : current));
    } catch (error) {
      console.error("Failed to retire equipment", error);
      setActionError(toErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="body-text text-muted-foreground">{pageDescription}</p>
        </div>
        <div className="flex gap-2">
          {isOverviewPage ? (
            <Button type="button" variant="outline" onClick={() => navigate("/management/equipment/list")}>
              View List
            </Button>
          ) : null}
          <Button type="button" onClick={openAddForm}>
            <MaterialIcon icon="add" className="text-lg" />
            <span>Add Equipment</span>
          </Button>
        </div>
      </header>

      {loadState === "loading" ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading equipment inventory...
          </CardContent>
        </Card>
      ) : null}

      {loadState === "error" ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-destructive">Unable to load equipment data.</p>
            <div>
              <Button type="button" variant="outline" onClick={() => void loadEquipment()}>
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
        <>
          {showOverviewSection ? (
            <section className="space-y-4">
              <h2 className="section-title">Equipment Overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <StatCard
                  title="Total Equipment"
                  value={metrics.totalEquipment}
                  tone="info"
                  active={quickFilter === "all"}
                  onClick={() => handleOverviewCardClick("all")}
                  icon="check_circle"
                />
                <StatCard
                  title="Active Equipment"
                  value={metrics.activeEquipment}
                  tone="success"
                  active={quickFilter === "active"}
                  onClick={() => handleOverviewCardClick("active")}
                  icon="check_circle"
                />
                <StatCard
                  title="Needs Maintenance"
                  value={metrics.needsMaintenance}
                  tone="warning"
                  active={quickFilter === "needs_maintenance"}
                  onClick={() => handleOverviewCardClick("needs_maintenance")}
                   icon="build"
                />
                <StatCard
                  title="Out of Order"
                  value={metrics.outOfOrder}
                  tone="danger"
                  active={quickFilter === "out_of_order"}
                  onClick={() => handleOverviewCardClick("out_of_order")}
                   icon="warning"
                />
                <StatCard
                  title="Upcoming Maintenance"
                  value={metrics.upcomingMaintenance}
                  helperText="Next 30 days"
                  tone="warning"
                  active={quickFilter === "upcoming_30"}
                  onClick={() => handleOverviewCardClick("upcoming_30")}
                   icon="schedule"
                />
                <StatCard
                  title="Total Asset Value"
                  value={formatCurrency(metrics.totalAssetValue)}
                  tone="primary"
                  active={false}
                  onClick={() => handleOverviewCardClick("all")}
                   icon="payments"
                />
              </div>
            </section>
          ) : null}

          {showListSection ? (
            <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Equipment List</h2>
              <Button type="button" variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>
                Clear List Filters
              </Button>
            </div>

            {quickFilter !== "all" ? (
              <p className="text-sm text-muted-foreground">
                Quick filter applied: <span className="font-medium text-foreground">{quickFilter.replaceAll("_", " ")}</span>
              </p>
            ) : null}

            <EquipmentFilters
              filters={filters}
              onChange={(next) => {
                setPage(1);
                setFilters((current) => ({ ...current, ...next }));
              }}
              onReset={clearFilters}
              hasActiveFilters={hasActiveFilters}
              mobileOpen={mobileFiltersOpen}
              onMobileOpenChange={setMobileFiltersOpen}
            />

            {equipment.length === 0 && totalItems === 0 && !hasActiveFilters ? (
              <Card>
                <CardContent className="space-y-3 p-8 text-center">
                  <p className="text-base font-medium text-foreground">No equipment assets yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first equipment item to begin asset and maintenance tracking.
                  </p>
                  <div>
                    <Button type="button" onClick={openAddForm}>
                      <MaterialIcon icon="add" className="text-lg" />
                      <span>Add Equipment</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {equipment.length === 0 && totalItems === 0 && hasActiveFilters ? (
              <Card>
                <CardContent className="space-y-3 p-8 text-center">
                  <p className="text-base font-medium text-foreground">No equipment matches current filters.</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust or clear filters to view equipment records.
                  </p>
                  <div>
                    <Button type="button" variant="outline" onClick={clearFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {equipment.length > 0 ? (
              <EquipmentTable
                equipment={equipment}
                sortField={sort.field}
                sortDirection={sort.direction}
                onSortChange={handleSortChange}
                onView={openDetail}
                onEdit={openEditForm}
                onLogMaintenance={openMaintenanceLog}
              />
            ) : null}

            {totalPages > 1 ? (
              <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing page {page} of {totalPages} ({totalItems} items)
                </p>
                <div className="flex items-center gap-2">
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    value={pageSize}
                    onChange={(event) => {
                      setPage(1);
                      setPageSize(Number(event.target.value));
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
            </section>
          ) : null}
        </>
      ) : null}

      <EquipmentDetailDrawer
        open={detailOpen}
        equipment={selectedEquipment}
        isMobile={isMobile}
        onClose={() => setDetailOpen(false)}
        onEdit={(record) => {
          setDetailOpen(false);
          openEditForm(record);
        }}
        onLogMaintenance={(record) => {
          setDetailOpen(false);
          openMaintenanceLog(record);
        }}
        onMarkOutOfOrder={(record) => {
          void handleMarkOutOfOrder(record);
        }}
        onRetire={(record) => {
          void handleRetireEquipment(record);
        }}
      />

      <EquipmentFormDrawer
        open={formOpen}
        isMobile={isMobile}
        mode={formMode}
        initialValues={formInitialValues}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <MaintenanceLogDrawer
        open={logOpen}
        isMobile={isMobile}
        equipment={logTargetEquipment}
        onClose={() => setLogOpen(false)}
        onSubmit={handleLogSubmit}
      />
    </div>
  );
}
