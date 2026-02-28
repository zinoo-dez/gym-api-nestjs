import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getApiErrorMessage } from "@/lib/api-error";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
    ManagementDataTable,
    ManagementFilterShell,
    ManagementStatCard,
    StaffDetailPanel,
    StaffFormPanel,
    StatusBadge,
} from "@/components/features/people";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { peopleService } from "@/services/people.service";
import {
    DEFAULT_STAFF_FORM_VALUES,
    STAFF_DEFAULT_FILTERS,
    STAFF_ROLE_VALUES,
    STAFF_SORT_OPTIONS,
    StaffFilterState,
    StaffFormValues,
    StaffListRecord,
    StaffProfile,
    applyStaffFilters,
    buildStaffFormValuesFromProfile,
    buildStaffListRecords,
    calculateStaffOverviewMetrics,
    extractStaffRoleOptions,
    formatDisplayDate,
    toEnumLabel,
} from "@/features/people";

const toErrorMessage = (error: unknown) =>
    getApiErrorMessage(error, "Unable to complete staff request.");

type LoadState = "loading" | "error" | "ready";
type StaffQuickFilter = "all" | "active" | "roles" | "new";

export function StaffManagementPage() {
    const isMobile = useIsMobile();

    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [actionError, setActionError] = useState<string | null>(null);

    const [staff, setStaff] = useState<StaffProfile[]>([]);

    const [filters, setFilters] = useState<StaffFilterState>(STAFF_DEFAULT_FILTERS);
    const [quickFilter, setQuickFilter] = useState<StaffQuickFilter>("all");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [detailStaff, setDetailStaff] = useState<StaffProfile | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [formInitialValues, setFormInitialValues] = useState<StaffFormValues>(DEFAULT_STAFF_FORM_VALUES);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

    const [actionSubmitting, setActionSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        setLoadState("loading");

        try {
            const records = await peopleService.listStaff();
            setStaff(records);
            setActionError(null);
            setLoadState("ready");
        } catch (error) {
            console.error("Failed to load staff management data", error);
            setActionError(toErrorMessage(error));
            setLoadState("error");
        }
    }, []);

    const loadStaffDetail = useCallback(async (staffId: string) => {
        try {
            const record = await peopleService.getStaffById(staffId);
            setDetailStaff(record);
        } catch (error) {
            console.error("Failed to load staff detail", error);
            setActionError(toErrorMessage(error));
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (!detailOpen || !selectedStaffId) {
            setDetailStaff(null);
            return;
        }

        void loadStaffDetail(selectedStaffId);
    }, [detailOpen, loadStaffDetail, selectedStaffId]);

    const staffRows = useMemo(() => buildStaffListRecords(staff), [staff]);

    const metrics = useMemo(() => calculateStaffOverviewMetrics(staffRows), [staffRows]);

    const filteredRows = useMemo(() => applyStaffFilters(staffRows, filters), [filters, staffRows]);

    const topRole = metrics.rolesDistribution[0]?.role;

    const quickFilteredRows = useMemo(() => {
        switch (quickFilter) {
            case "active":
                return filteredRows.filter((row) => row.isActive);
            case "new": {
                const now = new Date();
                return filteredRows.filter((row) => {
                    const joinDate = new Date(row.joinDate);
                    return (
                        joinDate.getFullYear() === now.getFullYear() && joinDate.getMonth() === now.getMonth()
                    );
                });
            }
            case "roles":
                return topRole ? filteredRows.filter((row) => row.role === topRole) : filteredRows;
            case "all":
            default:
                return filteredRows;
        }
    }, [filteredRows, quickFilter, topRole]);

    const selectedStaffRow = useMemo(
        () => staffRows.find((row) => row.id === selectedStaffId) ?? null,
        [selectedStaffId, staffRows],
    );

    const selectedStaffBase = useMemo(
        () => staff.find((record) => record.id === selectedStaffId) ?? null,
        [selectedStaffId, staff],
    );

    const detailStaffRecord = detailStaff ?? selectedStaffBase;

    const roleOptions = useMemo(
        () =>
            Array.from(new Set([...STAFF_ROLE_VALUES, ...extractStaffRoleOptions(staffRows)])).sort((left, right) =>
                left.localeCompare(right),
            ),
        [staffRows],
    );

    const hasActiveFilters =
        filters.search !== STAFF_DEFAULT_FILTERS.search ||
        filters.role !== STAFF_DEFAULT_FILTERS.role ||
        filters.sort !== STAFF_DEFAULT_FILTERS.sort ||
        quickFilter !== "all";

    const updateStaffState = useCallback((staffId: string, updates: Partial<StaffProfile>) => {
        setStaff((previous) =>
            previous.map((record) => (record.id === staffId ? { ...record, ...updates } : record)),
        );
        setDetailStaff((current) => (current?.id === staffId ? { ...current, ...updates } : current));
    }, []);

    const openStaffDetail = (row: StaffListRecord) => {
        setSelectedStaffId(row.id);
        setDetailOpen(true);
    };

    const openAddForm = () => {
        setFormMode("add");
        setEditingStaffId(null);
        setFormInitialValues(DEFAULT_STAFF_FORM_VALUES);
        setFormOpen(true);
    };

    const openEditForm = (record: StaffProfile) => {
        setFormMode("edit");
        setEditingStaffId(record.id);
        setFormInitialValues(buildStaffFormValuesFromProfile(record));
        setFormOpen(true);
    };

    const clearFilters = () => {
        setFilters(STAFF_DEFAULT_FILTERS);
        setQuickFilter("all");
    };

    const handleFormSubmit = async (values: StaffFormValues) => {
        try {
            setActionError(null);
            setActionSubmitting(true);

            if (formMode === "add") {
                const created = await peopleService.createStaff(
                    peopleService.toStaffCreatePayload({
                        email: values.email,
                        password: values.password,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        phone: values.phone,
                        address: values.address,
                        avatarUrl: values.avatarUrl,
                        staffRole: values.staffRole,
                        employeeId: values.employeeId,
                        hireDate: values.hireDate,
                        department: values.department,
                        position: values.position,
                        emergencyContact: values.emergencyContact,
                    }),
                );

                setStaff((previous) => [created, ...previous]);
                setFormOpen(false);
                setSelectedStaffId(created.id);
                setDetailOpen(true);
                return;
            }

            if (!editingStaffId) {
                return;
            }

            const updated = await peopleService.updateStaff(
                editingStaffId,
                peopleService.toStaffUpdatePayload({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    phone: values.phone,
                    address: values.address,
                    avatarUrl: values.avatarUrl,
                    staffRole: values.staffRole,
                    employeeId: values.employeeId,
                    hireDate: values.hireDate,
                    department: values.department,
                    position: values.position,
                    emergencyContact: values.emergencyContact,
                }),
            );

            setStaff((previous) =>
                previous.map((record) => (record.id === updated.id ? { ...record, ...updated } : record)),
            );
            setDetailStaff((current) => (current?.id === updated.id ? updated : current));
            setFormOpen(false);
        } catch (error) {
            console.error("Failed to save staff", error);
            setActionError(toErrorMessage(error));
        } finally {
            setActionSubmitting(false);
        }
    };

    const handleChangeRole = async (role: string) => {
        if (!detailStaffRecord || !role || role === detailStaffRecord.staffRole) {
            return;
        }

        try {
            setActionError(null);
            setActionSubmitting(true);

            const updated = await peopleService.updateStaff(detailStaffRecord.id, {
                staffRole: role,
            });

            setStaff((previous) =>
                previous.map((record) => (record.id === updated.id ? { ...record, ...updated } : record)),
            );
            setDetailStaff(updated);
        } catch (error) {
            console.error("Failed to change staff role", error);
            setActionError(toErrorMessage(error));
        } finally {
            setActionSubmitting(false);
        }
    };

    const handleToggleActive = async (record: StaffProfile, shouldActivate: boolean) => {
        if (shouldActivate) {
            setActionError("Activate action is unavailable because the staff API currently exposes deactivation only.");
            return;
        }

        const confirmed = window.confirm("Deactivate this staff account?");
        if (!confirmed) {
            return;
        }

        try {
            setActionError(null);
            setActionSubmitting(true);

            updateStaffState(record.id, { isActive: false });
            await peopleService.deactivateStaff(record.id);
        } catch (error) {
            console.error("Failed to deactivate staff", error);
            setActionError(toErrorMessage(error));
            await loadData();
            if (selectedStaffId === record.id) {
                await loadStaffDetail(record.id);
            }
        } finally {
            setActionSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
                </div>
                <Button type="button" onClick={openAddForm} className="h-10 px-8 shadow-md">
                    <MaterialIcon icon="add" className="text-lg" />
                    <span>Add Staff</span>
                </Button>
            </header>

            {loadState === "loading" ? (
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">Loading staff...</CardContent>
                </Card>
            ) : null}

            {loadState === "error" ? (
                <Card>
                    <CardContent className="flex flex-col gap-3 p-6">
                        <p className="text-sm text-destructive">Unable to load staff data.</p>
                        <div>
                            <Button type="button" variant="outline" onClick={() => void loadData()}>
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
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-foreground">Staff Overview</h2>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <ManagementStatCard
                                title="Total Staff"
                                value={metrics.totalStaff}
                                tone="info"
                                active={quickFilter === "all"}
                                onClick={() => setQuickFilter("all")}
                                icon="group"
                            />
                            <ManagementStatCard
                                title="Active Staff"
                                value={metrics.activeStaff}
                                tone="success"
                                active={quickFilter === "active"}
                                onClick={() => setQuickFilter((value) => (value === "active" ? "all" : "active"))}
                                icon="verified_user"
                            />
                            <ManagementStatCard
                                title="Roles Distribution"
                                value={`${metrics.rolesDistribution.length} roles`}
                                helperText={
                                    metrics.rolesDistribution[0]
                                        ? `${toEnumLabel(metrics.rolesDistribution[0].role)}: ${metrics.rolesDistribution[0].count}`
                                        : undefined
                                }
                                tone="warning"
                                active={quickFilter === "roles"}
                                onClick={() => setQuickFilter((value) => (value === "roles" ? "all" : "roles"))}
                                icon="business_center"
                            />
                            <ManagementStatCard
                                title="New This Month"
                                value={metrics.newStaffThisMonth}
                                tone="secondary"
                                active={quickFilter === "new"}
                                onClick={() => setQuickFilter((value) => (value === "new" ? "all" : "new"))}
                                icon="add"
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-foreground">Staff Directory</h2>

                        <ManagementFilterShell
                            searchValue={filters.search}
                            onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
                            searchPlaceholder="Search by staff name"
                            hasActiveFilters={hasActiveFilters}
                            onReset={clearFilters}
                            isMobile={isMobile}
                            mobileOpen={mobileFiltersOpen}
                            onMobileOpenChange={setMobileFiltersOpen}
                            mobileTitle="Staff Filters"
                        >
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="staff-filter-role">Role</Label>
                                    <Select
                                        id="staff-filter-role"
                                        value={filters.role}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                role: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="all">All Roles</option>
                                        {roleOptions.map((role) => (
                                            <option key={role} value={role}>
                                                {toEnumLabel(role)}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                                    <Label htmlFor="staff-filter-sort">Sort By</Label>
                                    <Select
                                        id="staff-filter-sort"
                                        value={filters.sort}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                sort: event.target.value as StaffFilterState["sort"],
                                            }))
                                        }
                                    >
                                        {STAFF_SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </ManagementFilterShell>

                        <ManagementDataTable
                            rows={quickFilteredRows}
                            rowKey={(row) => row.id}
                            onRowClick={openStaffDetail}
                            emptyTitle="No staff found"
                            emptyDescription="Try adjusting search and filter criteria."
                            columns={[
                                {
                                    id: "name",
                                    label: "Staff Name",
                                    render: (row) => (
                                        <div>
                                            <p className="font-medium text-foreground">{row.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{row.email}</p>
                                        </div>
                                    ),
                                },
                                {
                                    id: "role",
                                    label: "Role",
                                    render: (row) => <span className="text-foreground">{row.roleLabel}</span>,
                                },
                                {
                                    id: "status",
                                    label: "Status",
                                    render: (row) => <StatusBadge value={row.isActive ? "ACTIVE" : "INACTIVE"} />,
                                },
                                {
                                    id: "contact",
                                    label: "Contact",
                                    render: (row) => <span className="text-foreground">{row.phone || row.email}</span>,
                                },
                                {
                                    id: "joinDate",
                                    label: "Join Date",
                                    render: (row) => <span className="text-foreground">{formatDisplayDate(row.joinDate)}</span>,
                                },
                                {
                                    id: "actions",
                                    label: "Actions",
                                    align: "right",
                                    render: (row) => {
                                        const record = staff.find((item) => item.id === row.id);

                                        return (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openStaffDetail(row);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        if (record) {
                                                            openEditForm(record);
                                                        }
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive border-destructive/20 hover:bg-destructive/5"
                                                    disabled={!record?.isActive}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        if (record) {
                                                            void handleToggleActive(record, false);
                                                        }
                                                    }}
                                                >
                                                    Deactivate
                                                </Button>
                                            </div>
                                        );
                                    },
                                },
                            ]}
                            mobileCard={(row) => {
                                const record = staff.find((item) => item.id === row.id);

                                return (
                                    <article className="rounded-lg border bg-card p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-base font-semibold tracking-tight text-foreground">{row.fullName}</h3>
                                                <p className="text-sm text-muted-foreground">{row.roleLabel}</p>
                                            </div>
                                            <StatusBadge value={row.isActive ? "ACTIVE" : "INACTIVE"} />
                                        </div>

                                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</dt>
                                                <dd className="text-foreground">{row.phone || row.email}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Join Date</dt>
                                                <dd className="text-foreground">{formatDisplayDate(row.joinDate)}</dd>
                                            </div>
                                        </dl>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => openStaffDetail(row)}>
                                                View
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (record) {
                                                        openEditForm(record);
                                                    }
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                                                disabled={!record?.isActive}
                                                onClick={() => {
                                                    if (record) {
                                                        void handleToggleActive(record, false);
                                                    }
                                                }}
                                            >
                                                Deactivate
                                            </Button>
                                        </div>
                                    </article>
                                );
                            }}
                        />
                    </section>
                </>
            ) : null}

            <StaffDetailPanel
                open={detailOpen}
                isMobile={isMobile}
                onClose={() => setDetailOpen(false)}
                staff={detailStaffRecord}
                staffRow={selectedStaffRow}
                roleOptions={roleOptions}
                activationSupported={false}
                actionSubmitting={actionSubmitting}
                onEdit={() => {
                    if (detailStaffRecord) {
                        openEditForm(detailStaffRecord);
                    }
                }}
                onChangeRole={(role) => void handleChangeRole(role)}
                onToggleActive={(shouldActivate) => {
                    if (detailStaffRecord) {
                        void handleToggleActive(detailStaffRecord, shouldActivate);
                    }
                }}
            />

            <StaffFormPanel
                open={formOpen}
                isMobile={isMobile}
                mode={formMode}
                initialValues={formInitialValues}
                roleOptions={roleOptions}
                onClose={() => setFormOpen(false)}
                onSubmit={(values) => void handleFormSubmit(values)}
            />
        </div>
    );
}
