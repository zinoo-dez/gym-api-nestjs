import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
    ManagementDataTable,
    ManagementFilterShell,
    ManagementStatCard,
    MemberDetailPanel,
    MemberFormPanel,
    StatusBadge,
} from "@/components/features/people";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
    formatDisplayDate,
    formatDisplayDateTime,
    MEMBER_SORT_OPTIONS,
    useMembersManagement,
    MemberFilterState
} from "@/features/people";

export function MembersManagementPage() {
    const isMobile = useIsMobile();

    const {
        loadState,
        actionError,
        members,
        membershipPlans,
        filters,
        setFilters,
        mobileFiltersOpen,
        setMobileFiltersOpen,
        detailOpen,
        setDetailOpen,
        detailAttendance,
        detailReport,
        detailProgress,
        detailLoading,
        formOpen,
        setFormOpen,
        formMode,
        formInitialValues,
        actionSubmitting,
        overviewMetrics,
        filteredRows,
        memberStatusOptions,
        selectedMemberRow,
        selectedMemberPayments,
        detailMemberRecord,
        hasActiveFilters,
        loadData,
        openMemberDetail,
        openAddForm,
        openEditForm,
        clearFilters,
        handleSortHeaderChange,
        handleFormSubmit,
        handleAssignPlan,
        handleToggleFreeze,
        handleToggleActive,
        sortField,
        sortDirection,
    } = useMembersManagement();

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">Members Management</h1>
                    <p className="text-base text-muted-foreground max-w-2xl">
                        Full operational control over member profiles, membership lifecycle, and account status.
                    </p>
                </div>
                <Button type="button" onClick={openAddForm} className="h-14 px-8 shadow-md">
                    <MaterialIcon icon="person_add" className="text-xl" />
                    <span>Add Member</span>
                </Button>
            </header>

            {loadState === "loading" ? (
                <Card className="bg-card">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground font-medium">
                        <div className="flex flex-col items-center gap-3">
                            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Loading members directory...
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {loadState === "error" ? (
                <Card className="border-destructive">
                    <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                        <div className="size-14 flex items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <MaterialIcon icon="report_problem" className="text-3xl" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-foreground">Unable to load members data.</p>
                            <p className="text-xs text-muted-foreground">Please check your connection or try again.</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={() => void loadData()}>
                            <MaterialIcon icon="refresh" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            {actionError ? (
                <div className="rounded-xl bg-destructive/10 p-4 text-destructive text-sm font-bold shadow-sm">
                    {actionError}
                </div>
            ) : null}

            {loadState === "ready" ? (
                <>
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-foreground">Member Overview</h2>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <ManagementStatCard
                                title="Total Members"
                                value={overviewMetrics.totalMembers}
                                tone="info"
                                active={filters.quickFilter === "total" || filters.quickFilter === "all"}
                                onClick={() =>
                                    setFilters((current) => ({
                                        ...current,
                                        quickFilter: current.quickFilter === "total" ? "all" : "total",
                                    }))
                                }
                                icon="group"
                            />
                            <ManagementStatCard
                                title="Active Members"
                                value={overviewMetrics.activeMembers}
                                tone="success"
                                active={filters.quickFilter === "active"}
                                onClick={() =>
                                    setFilters((current) => ({
                                        ...current,
                                        quickFilter: current.quickFilter === "active" ? "all" : "active",
                                    }))
                                }
                                icon="person_check"
                            />
                            <ManagementStatCard
                                title="Expiring Memberships"
                                value={overviewMetrics.expiringMemberships}
                                tone="warning"
                                active={filters.quickFilter === "expiring"}
                                onClick={() =>
                                    setFilters((current) => ({
                                        ...current,
                                        quickFilter: current.quickFilter === "expiring" ? "all" : "expiring",
                                    }))
                                }
                                icon="emergency_home"
                            />
                            <ManagementStatCard
                                title="Inactive Members"
                                value={overviewMetrics.inactiveMembers}
                                tone="danger"
                                active={filters.quickFilter === "inactive"}
                                onClick={() =>
                                    setFilters((current) => ({
                                        ...current,
                                        quickFilter: current.quickFilter === "inactive" ? "all" : "inactive",
                                    }))
                                }
                                icon="person_off"
                            />
                            <ManagementStatCard
                                title="New This Month"
                                value={overviewMetrics.newMembersThisMonth}
                                tone="info"
                                active={filters.quickFilter === "new"}
                                onClick={() =>
                                    setFilters((current) => ({
                                        ...current,
                                        quickFilter: current.quickFilter === "new" ? "all" : "new",
                                    }))
                                }
                                icon="person_add"
                            />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-lg font-bold text-foreground">Member Directory</h2>

                        <ManagementFilterShell
                            searchValue={filters.search}
                            onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
                            searchPlaceholder="Search by name, phone, or email"
                            hasActiveFilters={hasActiveFilters}
                            onReset={clearFilters}
                            isMobile={isMobile}
                            mobileOpen={mobileFiltersOpen}
                            onMobileOpenChange={setMobileFiltersOpen}
                            mobileTitle="Member Filters"
                        >
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="member-filter-status">Membership Status</Label>
                                    <Select
                                        id="member-filter-status"
                                        value={filters.membershipStatus}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                membershipStatus: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="all">All Statuses</option>
                                        {memberStatusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.replace(/_/g, " ")}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="member-filter-plan">Plan</Label>
                                    <Select
                                        id="member-filter-plan"
                                        value={filters.planId}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                planId: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="all">All Plans</option>
                                        {membershipPlans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="member-filter-expiry-from">Expiry From</Label>
                                    <Input
                                        id="member-filter-expiry-from"
                                        type="date"
                                        value={filters.expiryFrom}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                expiryFrom: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="member-filter-expiry-to">Expiry To</Label>
                                    <Input
                                        id="member-filter-expiry-to"
                                        type="date"
                                        value={filters.expiryTo}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                expiryTo: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2 xl:col-span-4">
                                    <Label htmlFor="member-filter-sort">Sort By</Label>
                                    <Select
                                        id="member-filter-sort"
                                        value={filters.sort}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                sort: event.target.value as MemberFilterState["sort"],
                                            }))
                                        }
                                    >
                                        {MEMBER_SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </ManagementFilterShell>

                        <ManagementDataTable
                            rows={filteredRows}
                            rowKey={(row) => row.id}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSortChange={(field) =>
                                handleSortHeaderChange(field === "activity" ? "activity" : "expiry")
                            }
                            onRowClick={openMemberDetail}
                            emptyTitle="No members found"
                            emptyDescription="Try adjusting search and filter criteria."
                            columns={[
                                {
                                    id: "memberName",
                                    label: "Member Name",
                                    render: (row) => (
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{row.fullName}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{row.email}</p>
                                        </div>
                                    ),
                                },
                                {
                                    id: "plan",
                                    label: "Membership Plan",
                                    render: (row) => <span className="text-sm font-medium text-foreground">{row.planName}</span>,
                                },
                                {
                                    id: "status",
                                    label: "Status",
                                    render: (row) => (
                                        <StatusBadge label={row.membershipDisplayStatus} tone={row.membershipStatusTone} />
                                    ),
                                },
                                {
                                    id: "activity",
                                    label: "Last Check-in",
                                    sortable: true,
                                    render: (row) => (
                                        <span className="text-sm text-foreground">{formatDisplayDateTime(row.lastCheckIn)}</span>
                                    ),
                                },
                                {
                                    id: "expiry",
                                    label: "Expiry Date",
                                    sortable: true,
                                    render: (row) => <span className="text-sm text-foreground">{formatDisplayDate(row.expiryDate)}</span>,
                                },
                                {
                                    id: "payment",
                                    label: "Payment Status",
                                    render: (row) => <StatusBadge label={row.paymentStatus} tone={row.paymentStatusTone} />,
                                },
                                {
                                    id: "actions",
                                    label: "Actions",
                                    align: "right",
                                    render: (row) => {
                                        const member = members.find((item) => item.id === row.id);

                                        return (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openMemberDetail(row);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <MaterialIcon icon="visibility" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        if (member) {
                                                            openEditForm(member);
                                                        }
                                                    }}
                                                    title="Edit Member"
                                                >
                                                    <MaterialIcon icon="edit" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        if (member) {
                                                            void handleToggleActive(member, !member.isActive);
                                                        }
                                                    }}
                                                >
                                                    <MaterialIcon icon={member?.isActive ? "block" : "check_circle"} className="text-sm" />
                                                    <span>{member?.isActive ? "Deactivate" : "Activate"}</span>
                                                </Button>
                                            </div>
                                        );
                                    },
                                },
                            ]}
                            mobileCard={(row) => {
                                const member = members.find((item) => item.id === row.id);

                                return (
                                    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-0.5">
                                                <h3 className="text-base font-bold tracking-tight text-foreground">{row.fullName}</h3>
                                                <p className="text-xs text-muted-foreground">{row.email}</p>
                                            </div>
                                            <StatusBadge label={row.membershipDisplayStatus} tone={row.membershipStatusTone} />
                                        </div>

                                        <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Plan</dt>
                                                <dd className="text-foreground font-medium">{row.planName}</dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Expiry</dt>
                                                <dd className="text-foreground font-medium">{formatDisplayDate(row.expiryDate)}</dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Check-in</dt>
                                                <dd className="text-foreground font-medium">{formatDisplayDateTime(row.lastCheckIn)}</dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Payment</dt>
                                                <dd>
                                                    <StatusBadge label={row.paymentStatus} tone={row.paymentStatusTone} />
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="mt-6 flex flex-wrap gap-2">
                                            <Button type="button" variant="secondary" size="sm" onClick={() => openMemberDetail(row)} className="flex-1">
                                                <MaterialIcon icon="visibility" />
                                                View
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    if (member) {
                                                        openEditForm(member);
                                                    }
                                                }}
                                                className="flex-1"
                                            >
                                                <MaterialIcon icon="edit" />
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (member) {
                                                        void handleToggleActive(member, !member.isActive);
                                                    }
                                                }}
                                                className="flex-[2]"
                                            >
                                                <MaterialIcon icon={member?.isActive ? "block" : "check_circle"} />
                                                {member?.isActive ? "Deactivate" : "Activate"}
                                            </Button>
                                        </div>
                                    </article>
                                );
                            }}
                        />
                    </section>
                </>
            ) : null}

            <MemberDetailPanel
                open={detailOpen}
                isMobile={isMobile}
                onClose={() => setDetailOpen(false)}
                member={detailMemberRecord}
                memberRow={selectedMemberRow}
                attendanceSummary={detailReport}
                attendanceRecords={detailAttendance}
                payments={selectedMemberPayments}
                progress={detailProgress}
                membershipPlans={membershipPlans}
                loading={detailLoading}
                actionSubmitting={actionSubmitting}
                onEdit={() => {
                    if (detailMemberRecord) {
                        openEditForm(detailMemberRecord);
                    }
                }}
                onAssignPlan={(planId) => void handleAssignPlan(planId)}
                onToggleFreeze={(shouldFreeze) => void handleToggleFreeze(shouldFreeze)}
                onToggleActive={(shouldActivate) => {
                    if (detailMemberRecord) {
                        void handleToggleActive(detailMemberRecord, shouldActivate);
                    }
                }}
            />

            <MemberFormPanel
                open={formOpen}
                isMobile={isMobile}
                mode={formMode}
                initialValues={formInitialValues}
                onClose={() => setFormOpen(false)}
                onSubmit={(values) => void handleFormSubmit(values)}
            />
        </div>
    );
}
