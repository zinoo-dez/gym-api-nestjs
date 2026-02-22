import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  Power,
  RefreshCcw,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  ManagementDataTable,
  ManagementFilterShell,
  ManagementStatCard,
  MemberDetailPanel,
  MemberFormPanel,
  StatusBadge,
} from "@/components/features/people";
import { useIsMobile } from "@/hooks/useIsMobile";
import { peopleService } from "@/services/people.service";
import {
  AttendanceRecord,
  AttendanceReport,
  DEFAULT_MEMBER_FORM_VALUES,
  MEMBER_DEFAULT_FILTERS,
  MEMBER_SORT_OPTIONS,
  MemberFilterState,
  MemberFormValues,
  MemberListRecord,
  MemberPaymentRecord,
  MemberProfile,
  MemberProgressRecord,
  MembershipPlanOption,
  applyMemberFilters,
  buildMemberFormValuesFromProfile,
  buildMemberListRecords,
  calculateMemberOverviewMetrics,
  extractMemberStatusOptions,
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/people";

const toErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const apiMessage = err.response?.data?.message;

    if (Array.isArray(apiMessage)) {
      return apiMessage.join(", ");
    }

    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }

    if (typeof err.message === "string" && err.message.length > 0) {
      return err.message;
    }
  }

  return "Unable to complete member request.";
};

type LoadState = "loading" | "error" | "ready";

export function MembersManagementPage() {
  const isMobile = useIsMobile();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [payments, setPayments] = useState<MemberPaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlanOption[]>([]);

  const [filters, setFilters] = useState<MemberFilterState>(MEMBER_DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [detailMember, setDetailMember] = useState<MemberProfile | null>(null);
  const [detailAttendance, setDetailAttendance] = useState<AttendanceRecord[]>([]);
  const [detailReport, setDetailReport] = useState<AttendanceReport | null>(null);
  const [detailProgress, setDetailProgress] = useState<MemberProgressRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formInitialValues, setFormInitialValues] = useState<MemberFormValues>(
    DEFAULT_MEMBER_FORM_VALUES,
  );
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoadState("loading");

    try {
      const [memberRows, paymentRows, attendanceRows, planRows] = await Promise.all([
        peopleService.listMembers(),
        peopleService.listPayments(),
        peopleService.listAttendance(),
        peopleService.listMembershipPlans(),
      ]);

      setMembers(memberRows);
      setPayments(paymentRows);
      setAttendance(attendanceRows);
      setMembershipPlans(planRows);
      setActionError(null);
      setLoadState("ready");
    } catch (error) {
      console.error("Failed to load members management data", error);
      setActionError(toErrorMessage(error));
      setLoadState("error");
    }
  }, []);

  const loadMemberDetail = useCallback(async (memberId: string) => {
    setDetailLoading(true);

    try {
      const [member, attendanceRows, report, progress] = await Promise.all([
        peopleService.getMemberById(memberId),
        peopleService.listAttendance({ memberId }),
        peopleService.getAttendanceReport(memberId),
        peopleService.getMemberProgress(memberId),
      ]);

      setDetailMember(member);
      setDetailAttendance(attendanceRows);
      setDetailReport(report);
      setDetailProgress(progress);
      setActionError(null);
    } catch (error) {
      console.error("Failed to load member detail", error);
      setActionError(toErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!detailOpen || !selectedMemberId) {
      setDetailMember(null);
      setDetailAttendance([]);
      setDetailReport(null);
      setDetailProgress([]);
      return;
    }

    void loadMemberDetail(selectedMemberId);
  }, [detailOpen, selectedMemberId, loadMemberDetail]);

  const memberRows = useMemo(
    () => buildMemberListRecords(members, payments, attendance),
    [members, payments, attendance],
  );

  const overviewMetrics = useMemo(
    () => calculateMemberOverviewMetrics(members, memberRows),
    [memberRows, members],
  );

  const filteredRows = useMemo(() => applyMemberFilters(memberRows, filters), [filters, memberRows]);

  const memberStatusOptions = useMemo(() => extractMemberStatusOptions(memberRows), [memberRows]);

  const selectedMemberRow = useMemo(
    () => memberRows.find((row) => row.id === selectedMemberId) ?? null,
    [memberRows, selectedMemberId],
  );

  const selectedMemberPayments = useMemo(
    () => payments.filter((payment) => payment.memberId === selectedMemberId),
    [payments, selectedMemberId],
  );

  const selectedMemberBase = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId],
  );

  const detailMemberRecord = detailMember ?? selectedMemberBase;

  const hasActiveFilters =
    filters.search !== MEMBER_DEFAULT_FILTERS.search ||
    filters.membershipStatus !== MEMBER_DEFAULT_FILTERS.membershipStatus ||
    filters.planId !== MEMBER_DEFAULT_FILTERS.planId ||
    filters.expiryFrom !== MEMBER_DEFAULT_FILTERS.expiryFrom ||
    filters.expiryTo !== MEMBER_DEFAULT_FILTERS.expiryTo ||
    filters.sort !== MEMBER_DEFAULT_FILTERS.sort ||
    filters.quickFilter !== MEMBER_DEFAULT_FILTERS.quickFilter;

  const updateMemberActiveState = useCallback((memberId: string, isActive: boolean) => {
    setMembers((previous) =>
      previous.map((member) => (member.id === memberId ? { ...member, isActive } : member)),
    );
    setDetailMember((current) => (current?.id === memberId ? { ...current, isActive } : current));
  }, []);

  const updateMemberSubscriptionStatus = useCallback(
    (memberId: string, subscriptionId: string, status: string) => {
      setMembers((previous) =>
        previous.map((member) => {
          if (member.id !== memberId) {
            return member;
          }

          return {
            ...member,
            subscriptions: member.subscriptions.map((subscription) =>
              subscription.id === subscriptionId ? { ...subscription, status } : subscription,
            ),
          };
        }),
      );

      setDetailMember((current) => {
        if (!current || current.id !== memberId) {
          return current;
        }

        return {
          ...current,
          subscriptions: current.subscriptions.map((subscription) =>
            subscription.id === subscriptionId ? { ...subscription, status } : subscription,
          ),
        };
      });
    },
    [],
  );

  const openMemberDetail = (row: MemberListRecord) => {
    setSelectedMemberId(row.id);
    setDetailOpen(true);
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingMemberId(null);
    setFormInitialValues(DEFAULT_MEMBER_FORM_VALUES);
    setFormOpen(true);
  };

  const openEditForm = (member: MemberProfile) => {
    setFormMode("edit");
    setEditingMemberId(member.id);
    setFormInitialValues(buildMemberFormValuesFromProfile(member));
    setFormOpen(true);
  };

  const clearFilters = () => {
    setFilters(MEMBER_DEFAULT_FILTERS);
  };

  const handleSortHeaderChange = (field: "expiry" | "activity") => {
    setFilters((current) => {
      if (field === "expiry") {
        return {
          ...current,
          sort: current.sort === "expiry_asc" ? "expiry_desc" : "expiry_asc",
        };
      }

      return {
        ...current,
        sort: current.sort === "activity_desc" ? "activity_asc" : "activity_desc",
      };
    });
  };

  const handleFormSubmit = async (values: MemberFormValues) => {
    try {
      setActionError(null);
      setActionSubmitting(true);

      if (formMode === "add") {
        const created = await peopleService.createMember(peopleService.toMemberCreatePayload(values));
        setMembers((previous) => [created, ...previous]);
        setFormOpen(false);
        setSelectedMemberId(created.id);
        setDetailOpen(true);
        return;
      }

      if (!editingMemberId) {
        return;
      }

      const updated = await peopleService.updateMember(
        editingMemberId,
        peopleService.toMemberUpdatePayload(values),
      );

      setMembers((previous) =>
        previous.map((member) => (member.id === updated.id ? { ...member, ...updated } : member)),
      );

      setDetailMember((current) => (current?.id === updated.id ? updated : current));
      setFormOpen(false);
    } catch (error) {
      console.error("Failed to save member", error);
      setActionError(toErrorMessage(error));
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAssignPlan = async (planId: string) => {
    if (!selectedMemberRow || !planId) {
      return;
    }

    try {
      setActionError(null);
      setActionSubmitting(true);

      if (selectedMemberRow.currentSubscriptionId) {
        await peopleService.changeMembershipPlan(selectedMemberRow.id, planId);
      } else {
        await peopleService.assignMembership({
          memberId: selectedMemberRow.id,
          planId,
          startDate: new Date().toISOString(),
        });
      }

      await loadData();
      await loadMemberDetail(selectedMemberRow.id);
    } catch (error) {
      console.error("Failed to assign member plan", error);
      setActionError(toErrorMessage(error));
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleToggleFreeze = async (shouldFreeze: boolean) => {
    if (!selectedMemberRow?.currentSubscriptionId) {
      return;
    }

    const nextStatus = shouldFreeze ? "FROZEN" : "ACTIVE";

    try {
      setActionError(null);
      setActionSubmitting(true);

      updateMemberSubscriptionStatus(
        selectedMemberRow.id,
        selectedMemberRow.currentSubscriptionId,
        nextStatus,
      );

      if (shouldFreeze) {
        await peopleService.freezeMembership(selectedMemberRow.currentSubscriptionId);
      } else {
        await peopleService.unfreezeMembership(selectedMemberRow.currentSubscriptionId);
      }

      await loadMemberDetail(selectedMemberRow.id);
    } catch (error) {
      console.error("Failed to toggle membership freeze", error);
      setActionError(toErrorMessage(error));
      await loadData();
      if (selectedMemberRow.id) {
        await loadMemberDetail(selectedMemberRow.id);
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleToggleActive = async (member: MemberProfile, shouldActivate: boolean) => {
    if (!shouldActivate) {
      const confirmed = window.confirm("Deactivate this member account?");
      if (!confirmed) {
        return;
      }
    }

    try {
      setActionError(null);
      setActionSubmitting(true);

      updateMemberActiveState(member.id, shouldActivate);

      if (shouldActivate) {
        await peopleService.activateMember(member.id);
      } else {
        await peopleService.deactivateMember(member.id);
      }

      if (selectedMemberId === member.id) {
        await loadMemberDetail(member.id);
      }
    } catch (error) {
      console.error("Failed to update member active status", error);
      setActionError(toErrorMessage(error));
      await loadData();
      if (selectedMemberId === member.id) {
        await loadMemberDetail(member.id);
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  const sortField = filters.sort.startsWith("expiry") ? "expiry" : "activity";
  const sortDirection = filters.sort.endsWith("asc") ? "asc" : "desc";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Members Management</h1>
          <p className="body-text text-muted-foreground">
            Full operational control over member profiles, membership lifecycle, and account status.
          </p>
        </div>
        <Button type="button" onClick={openAddForm}>
          <Plus className="size-4" />
          Add Member
        </Button>
      </header>

      {loadState === "loading" ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading members...</CardContent>
        </Card>
      ) : null}

      {loadState === "error" ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-danger">Unable to load members data.</p>
            <div>
              <Button type="button" variant="outline" onClick={() => void loadData()}>
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
            <h2 className="section-title">Member Overview</h2>
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
                icon={Users}
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
                icon={UserCheck}
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
                icon={AlertTriangle}
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
                icon={UserX}
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
                icon={UserPlus}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="section-title">Member Directory</h2>

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
                      <p className="font-medium text-foreground">{row.fullName}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  ),
                },
                {
                  id: "plan",
                  label: "Membership Plan",
                  render: (row) => <span className="text-foreground">{row.planName}</span>,
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
                    <span className="text-foreground">{formatDisplayDateTime(row.lastCheckIn)}</span>
                  ),
                },
                {
                  id: "expiry",
                  label: "Expiry Date",
                  sortable: true,
                  render: (row) => <span className="text-foreground">{formatDisplayDate(row.expiryDate)}</span>,
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
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            openMemberDetail(row);
                          }}
                        >
                          <Eye className="size-4" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (member) {
                              openEditForm(member);
                            }
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (member) {
                              void handleToggleActive(member, !member.isActive);
                            }
                          }}
                        >
                          <Power className="size-4" />
                          {member?.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    );
                  },
                },
              ]}
              mobileCard={(row) => {
                const member = members.find((item) => item.id === row.id);

                return (
                  <article className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-foreground">{row.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{row.email}</p>
                      </div>
                      <StatusBadge label={row.membershipDisplayStatus} tone={row.membershipStatusTone} />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plan</dt>
                        <dd className="text-foreground">{row.planName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expiry</dt>
                        <dd className="text-foreground">{formatDisplayDate(row.expiryDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Check-in</dt>
                        <dd className="text-foreground">{formatDisplayDateTime(row.lastCheckIn)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment</dt>
                        <dd>
                          <StatusBadge label={row.paymentStatus} tone={row.paymentStatusTone} />
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openMemberDetail(row)}>
                        <Eye className="size-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (member) {
                            openEditForm(member);
                          }
                        }}
                      >
                        <Pencil className="size-4" />
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
                      >
                        <Power className="size-4" />
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
