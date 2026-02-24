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
  applyEquipmentFilters,
  calculateEquipmentMetrics,
  formatCurrency,
  getDefaultFormValues,
  getFormValuesFromEquipment,
  isDueInNextDays,
  sortEquipmentRecords,
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
  primary: "text-on-primary-container bg-primary-container",
  success: "text-on-success-container bg-success-container",
  warning: "text-on-warning-container bg-warning-container",
  danger: "text-on-error-container bg-error-container",
  info: "text-on-primary-container bg-primary-container",
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
          : "border-outline-variant bg-surface-container-low hover:bg-surface-container hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="space-y-2">
          <p className="text-label-medium font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
            {title}
          </p>
          <p className="text-headline-small font-bold tracking-tight text-on-surface">{value}</p>
          {helperText ? (
            <p className="text-body-small text-on-surface-variant">{helperText}</p>
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
          <MaterialIcon icon="check" className="text-on-primary text-sm" weight={700} opticalSize={16} />
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
  const [searchParams] = useSearchParams();

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
      const records = await equipmentService.listEquipment();
      setEquipment(records);
      setActionError(null);
      setLoadState("ready");
    } catch (error) {
      console.error("Failed to load equipment records", error);
      setActionError(toErrorMessage(error));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadEquipment();
  }, [loadEquipment]);

  useEffect(() => {
    if (isListPage) {
      setQuickFilter(quickFilterFromQuery);
    }
  }, [isListPage, quickFilterFromQuery]);

  const metrics = useMemo(() => calculateEquipmentMetrics(equipment), [equipment]);

  const upsertEquipmentRecord = useCallback((record: EquipmentRecord) => {
    setEquipment((previous) => {
      const exists = previous.some((item) => item.id === record.id);
      if (!exists) {
        return [record, ...previous];
      }

      return previous.map((item) => (item.id === record.id ? record : item));
    });

    setSelectedEquipment((current) => (current?.id === record.id ? record : current));
    setLogTargetEquipment((current) => (current?.id === record.id ? record : current));
  }, []);

  const filteredAndSorted = useMemo(() => {
    const filtered = applyEquipmentFilters(equipment, filters).filter((record) => {
      switch (quickFilter) {
        case "active":
          return record.isActive;
        case "needs_maintenance":
          return record.condition === "needs_maintenance";
        case "out_of_order":
          return record.condition === "out_of_order";
        case "upcoming_30":
          return isDueInNextDays(record, 30);
        default:
          return true;
      }
    });

    return sortEquipmentRecords(filtered, sort.field, sort.direction);
  }, [equipment, filters, quickFilter, sort.direction, sort.field]);

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.category !== "all" ||
    filters.condition !== "all" ||
    filters.maintenanceDue !== "all" ||
    quickFilter !== "all";

  const handleSortChange = (field: EquipmentSortField) => {
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
        upsertEquipmentRecord(created);
        setFormOpen(false);
        setSelectedEquipment(created);
        setDetailOpen(true);
        return;
      }

      if (!editingEquipmentId) {
        return;
      }

      const updated = await equipmentService.updateEquipment(editingEquipmentId, values);
      upsertEquipmentRecord(updated);
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
      upsertEquipmentRecord(updated);
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
      upsertEquipmentRecord(updated);
    } catch (error) {
      console.error("Failed to mark equipment out of order", error);
      setActionError(toErrorMessage(error));
    }
  };

  const handleRetireEquipment = async (record: EquipmentRecord) => {
    try {
      setActionError(null);
      const updated = await equipmentService.retireEquipment(record.id);
      upsertEquipmentRecord(updated);
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
            <Button type="button" variant="outlined" onClick={() => navigate("/management/equipment/list")}>
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
            <p className="text-sm text-danger">Unable to load equipment data.</p>
            <div>
              <Button type="button" variant="outlined" onClick={() => void loadEquipment()}>
                <MaterialIcon icon="refresh" className="text-lg" />
                <span>Retry</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {actionError ? (
        <Card>
          <CardContent className="p-4 text-sm text-danger">{actionError}</CardContent>
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
              <Button type="button" variant="text" onClick={clearFilters} disabled={!hasActiveFilters}>
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
              onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
              onReset={clearFilters}
              hasActiveFilters={hasActiveFilters}
              mobileOpen={mobileFiltersOpen}
              onMobileOpenChange={setMobileFiltersOpen}
            />

            {equipment.length === 0 ? (
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

            {equipment.length > 0 && filteredAndSorted.length === 0 ? (
              <Card>
                <CardContent className="space-y-3 p-8 text-center">
                  <p className="text-base font-medium text-foreground">No equipment matches current filters.</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust or clear filters to view equipment records.
                  </p>
                  <div>
                    <Button type="button" variant="outlined" onClick={clearFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {filteredAndSorted.length > 0 ? (
              <EquipmentTable
                equipment={filteredAndSorted}
                sortField={sort.field}
                sortDirection={sort.direction}
                onSortChange={handleSortChange}
                onView={openDetail}
                onEdit={openEditForm}
                onLogMaintenance={openMaintenanceLog}
              />
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
