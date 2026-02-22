import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCcw,
  Wallet,
  Wrench,
} from "lucide-react";

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

interface SortState {
  field: EquipmentSortField;
  direction: SortDirection;
}

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
  icon: ComponentType<{ className?: string }>;
}

const TONE_STYLES: Record<StatCardProps["tone"], string> = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/20",
  warning: "text-warning bg-warning/20",
  danger: "text-danger bg-danger/20",
  info: "text-info bg-info/20",
};

function StatCard({
  title,
  value,
  tone,
  active,
  onClick,
  helperText,
  icon: Icon,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/30 ${
        active ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <div className={`rounded-full p-2 ${TONE_STYLES[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </button>
  );
}

export function EquipmentManagementPage() {
  const user = useAuthStore((state) => state.user);
  const isMobile = useIsMobile();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EquipmentFilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
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
  };

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
          <h1 className="page-title">Equipment Management</h1>
          <p className="body-text text-muted-foreground">
            Track gym assets, maintenance schedules, and equipment lifecycle costs.
          </p>
        </div>
        <Button type="button" onClick={openAddForm}>
          <Plus className="size-4" />
          Add Equipment
        </Button>
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
              <Button type="button" variant="outline" onClick={() => void loadEquipment()}>
                <RefreshCcw className="size-4" />
                Retry
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
          <section className="space-y-4">
            <h2 className="section-title">Equipment Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard
                title="Total Equipment"
                value={metrics.totalEquipment}
                tone="info"
                active={quickFilter === "all"}
                onClick={() => setQuickFilter("all")}
                icon={CheckCircle2}
              />
              <StatCard
                title="Active Equipment"
                value={metrics.activeEquipment}
                tone="success"
                active={quickFilter === "active"}
                onClick={() => setQuickFilter("active")}
                icon={CheckCircle2}
              />
              <StatCard
                title="Needs Maintenance"
                value={metrics.needsMaintenance}
                tone="warning"
                active={quickFilter === "needs_maintenance"}
                onClick={() => setQuickFilter("needs_maintenance")}
                icon={Wrench}
              />
              <StatCard
                title="Out of Order"
                value={metrics.outOfOrder}
                tone="danger"
                active={quickFilter === "out_of_order"}
                onClick={() => setQuickFilter("out_of_order")}
                icon={AlertTriangle}
              />
              <StatCard
                title="Upcoming Maintenance"
                value={metrics.upcomingMaintenance}
                helperText="Next 30 days"
                tone="warning"
                active={quickFilter === "upcoming_30"}
                onClick={() => setQuickFilter("upcoming_30")}
                icon={Clock3}
              />
              <StatCard
                title="Total Asset Value"
                value={formatCurrency(metrics.totalAssetValue)}
                tone="primary"
                active={false}
                onClick={() => setQuickFilter("all")}
                icon={Wallet}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Equipment List</h2>
              <Button type="button" variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>
                Clear List Filters
              </Button>
            </div>

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
                      <Plus className="size-4" />
                      Add Equipment
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
                    <Button type="button" variant="outline" onClick={clearFilters}>
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
