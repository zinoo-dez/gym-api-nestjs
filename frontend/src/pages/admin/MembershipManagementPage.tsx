import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

import {
  FeatureFilterState,
  FeatureFormValues,
  FeatureLibraryRecord,
  MemberRecord,
  MembershipDetailRecord,
  MembershipFilterState,
  MembershipPlanFilterState,
  MembershipPlanFormValues,
  MembershipPlanRecord,
  MembershipQuickFilter,
  MembershipRecord,
  PaymentRecord,
  applyFeatureFilters,
  applyMembershipFilters,
  applyMembershipPlanFilters,
  buildFeatureLibraryRecords,
  buildMembershipHistory,
  buildMembershipPlanRecords,
  buildMembershipRecords,
  calculateMembershipOverviewMetrics,
  getDefaultFeatureFilterState,
  getDefaultMembershipFilterState,
  getDefaultMembershipPlanFilterState,
  getDefaultMembershipPlanFormValues,
  getDuplicatedPlanFormValues,
  getMembershipPlanFormValuesFromPlan,
} from "@/features/memberships";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { useIsMobile } from "@/hooks/useIsMobile";
import { membershipService } from "@/services/membership.service";
import { MembershipOverviewKpis } from "@/components/features/memberships/MembershipOverviewKpis";
import { MembershipPlansTable } from "@/components/features/memberships/MembershipPlansTable";
import { MembershipPlanDetailDrawer } from "@/components/features/memberships/MembershipPlanDetailDrawer";
import { MembershipPlanFormDrawer } from "@/components/features/memberships/MembershipPlanFormDrawer";
import { MemberMembershipTable } from "@/components/features/memberships/MemberMembershipTable";
import { MembershipDetailDrawer } from "@/components/features/memberships/MembershipDetailDrawer";
import { FeatureLibraryTable } from "@/components/features/memberships/FeatureLibraryTable";
import { FeatureFormDrawer } from "@/components/features/memberships/FeatureFormDrawer";

const REVENUE_PERIOD_OPTIONS = [30, 90, 365] as const;

type LoadState = "loading" | "error" | "ready";

export type MembershipManagementView = "plans" | "memberships" | "features";

interface MembershipManagementPageProps {
  view?: MembershipManagementView;
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

  return "Unable to complete membership request.";
};

export function MembershipManagementPage({ view = "plans" }: MembershipManagementPageProps) {
  const isMobile = useIsMobile();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  const [plans, setPlans] = useState<MembershipPlanRecord[]>([]);
  const [features, setFeatures] = useState<FeatureLibraryRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const [revenuePeriodDays, setRevenuePeriodDays] = useState<number>(30);

  const defaultPlanFilters = useMemo<MembershipPlanFilterState>(
    () => getDefaultMembershipPlanFilterState(),
    [],
  );
  const defaultMembershipFilters = useMemo<MembershipFilterState>(
    () => getDefaultMembershipFilterState(),
    [],
  );
  const defaultFeatureFilters = useMemo<FeatureFilterState>(
    () => getDefaultFeatureFilterState(),
    [],
  );

  const [planFilters, setPlanFilters] = useState<MembershipPlanFilterState>(defaultPlanFilters);
  const [membershipFilters, setMembershipFilters] = useState<MembershipFilterState>(
    defaultMembershipFilters,
  );
  const [featureFilters, setFeatureFilters] = useState<FeatureFilterState>(defaultFeatureFilters);

  const [planFiltersMobileOpen, setPlanFiltersMobileOpen] = useState(false);
  const [membershipFiltersMobileOpen, setMembershipFiltersMobileOpen] = useState(false);
  const [featureFiltersMobileOpen, setFeatureFiltersMobileOpen] = useState(false);

  const [planDetailOpen, setPlanDetailOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [planFormMode, setPlanFormMode] = useState<"add" | "edit">("add");
  const [planFormValues, setPlanFormValues] = useState<MembershipPlanFormValues>(
    getDefaultMembershipPlanFormValues(),
  );
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [featureFormOpen, setFeatureFormOpen] = useState(false);
  const [featureFormMode, setFeatureFormMode] = useState<"add" | "edit">("add");
  const [featureFormValues, setFeatureFormValues] = useState<FeatureFormValues>({
    name: "",
    description: "",
  });
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const [membershipDetailOpen, setMembershipDetailOpen] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [selectedMembershipDetail, setSelectedMembershipDetail] = useState<MembershipDetailRecord | null>(
    null,
  );
  const [membershipDetailLoading, setMembershipDetailLoading] = useState(false);

  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [featureSubmitting, setFeatureSubmitting] = useState(false);
  const [membershipActionSubmitting, setMembershipActionSubmitting] = useState(false);

  const [disablingPlanId, setDisablingPlanId] = useState<string | null>(null);
  const [deletingFeatureId, setDeletingFeatureId] = useState<string | null>(null);

  const loadMembershipData = useCallback(async () => {
    setLoadState("loading");

    try {
      const [plansData, featuresData, membersData, paymentsData] = await Promise.all([
        membershipService.listMembershipPlans(),
        membershipService.listFeatures(),
        membershipService.listMembers(),
        membershipService.listPayments(),
      ]);

      setPlans(plansData);
      setFeatures(featuresData);
      setMembers(membersData);
      setPayments(paymentsData);
      setActionError(null);
      setLoadState("ready");
    } catch (error) {
      console.error("Failed to load membership data", error);
      setActionError(toErrorMessage(error));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadMembershipData();
  }, [loadMembershipData]);

  const membershipRecords = useMemo(() => buildMembershipRecords(members, payments), [members, payments]);

  const planRecords = useMemo(
    () => buildMembershipPlanRecords(plans, membershipRecords),
    [plans, membershipRecords],
  );

  const featureRecords = useMemo(
    () => buildFeatureLibraryRecords(features, planRecords),
    [features, planRecords],
  );

  const overviewMetrics = useMemo(
    () => calculateMembershipOverviewMetrics(membershipRecords, payments, revenuePeriodDays),
    [membershipRecords, payments, revenuePeriodDays],
  );

  const filteredPlans = useMemo(
    () => applyMembershipPlanFilters(planRecords, planFilters),
    [planFilters, planRecords],
  );

  const filteredMemberships = useMemo(
    () => applyMembershipFilters(membershipRecords, membershipFilters),
    [membershipFilters, membershipRecords],
  );

  const filteredFeatures = useMemo(
    () => applyFeatureFilters(featureRecords, featureFilters),
    [featureFilters, featureRecords],
  );

  const selectedPlan = useMemo(
    () => planRecords.find((plan) => plan.id === selectedPlanId) ?? null,
    [planRecords, selectedPlanId],
  );

  const selectedMembership = useMemo(
    () => membershipRecords.find((membership) => membership.id === selectedMembershipId) ?? null,
    [membershipRecords, selectedMembershipId],
  );

  const selectedPlanMemberships = useMemo(() => {
    if (!selectedPlanId) {
      return [];
    }

    return membershipRecords.filter((membership) => membership.planId === selectedPlanId);
  }, [membershipRecords, selectedPlanId]);

  const selectedMembershipPayments = useMemo(() => {
    if (!selectedMembershipId) {
      return [];
    }

    return payments
      .filter((payment) => payment.subscriptionId === selectedMembershipId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [payments, selectedMembershipId]);

  const selectedMembershipHistory = useMemo(() => {
    if (!selectedMembership) {
      return [];
    }

    return buildMembershipHistory(membershipRecords, selectedMembership.memberId);
  }, [membershipRecords, selectedMembership]);

  useEffect(() => {
    if (!membershipDetailOpen || !selectedMembershipId) {
      setSelectedMembershipDetail(null);
      return;
    }

    let cancelled = false;

    const loadSelectedMembership = async () => {
      setMembershipDetailLoading(true);

      try {
        const detail = await membershipService.getMembershipById(selectedMembershipId);

        if (!cancelled) {
          setSelectedMembershipDetail(detail);
        }
      } catch (error) {
        console.error("Failed to load membership detail", error);

        if (!cancelled) {
          setActionError(toErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setMembershipDetailLoading(false);
        }
      }
    };

    void loadSelectedMembership();

    return () => {
      cancelled = true;
    };
  }, [membershipDetailOpen, selectedMembershipId]);

  const hasActivePlanFilters =
    planFilters.search !== defaultPlanFilters.search ||
    planFilters.status !== defaultPlanFilters.status ||
    planFilters.sort !== defaultPlanFilters.sort;

  const hasActiveMembershipFilters =
    membershipFilters.search !== defaultMembershipFilters.search ||
    membershipFilters.status !== defaultMembershipFilters.status ||
    membershipFilters.planId !== defaultMembershipFilters.planId ||
    membershipFilters.expiryFrom !== defaultMembershipFilters.expiryFrom ||
    membershipFilters.expiryTo !== defaultMembershipFilters.expiryTo ||
    membershipFilters.sort !== defaultMembershipFilters.sort ||
    membershipFilters.quickFilter !== defaultMembershipFilters.quickFilter;

  const hasActiveFeatureFilters =
    featureFilters.search !== defaultFeatureFilters.search ||
    featureFilters.status !== defaultFeatureFilters.status;

  const updatePlanRecord = (record: MembershipPlanRecord) => {
    setPlans((previous) => {
      const exists = previous.some((plan) => plan.id === record.id);

      if (!exists) {
        return [record, ...previous];
      }

      return previous.map((plan) => (plan.id === record.id ? record : plan));
    });

    setSelectedPlanId((current) => (current === record.id ? record.id : current));
  };

  const updateFeatureRecord = (record: FeatureLibraryRecord) => {
    setFeatures((previous) => {
      const exists = previous.some((feature) => feature.id === record.id);

      if (!exists) {
        return [record, ...previous];
      }

      return previous.map((feature) => (feature.id === record.id ? record : feature));
    });
  };

  const applyOptimisticMembershipStatus = (membershipId: string, status: MembershipRecord["statusRaw"]) => {
    setMembers((previous) =>
      previous.map((member) => ({
        ...member,
        subscriptions: member.subscriptions.map((subscription) =>
          subscription.id === membershipId
            ? {
                ...subscription,
                status,
              }
            : subscription,
        ),
      })),
    );
  };

  const openAddPlanForm = () => {
    setPlanFormMode("add");
    setEditingPlanId(null);
    setPlanFormValues(getDefaultMembershipPlanFormValues());
    setPlanFormOpen(true);
  };

  const openEditPlanForm = (plan: MembershipPlanRecord) => {
    setPlanFormMode("edit");
    setEditingPlanId(plan.id);
    setPlanFormValues(getMembershipPlanFormValuesFromPlan(plan));
    setPlanFormOpen(true);
  };

  const openPlanDetail = (plan: MembershipPlanRecord) => {
    setSelectedPlanId(plan.id);
    setPlanDetailOpen(true);
  };

  const openFeatureAddForm = () => {
    setFeatureFormMode("add");
    setEditingFeatureId(null);
    setFeatureFormValues({
      name: "",
      description: "",
    });
    setFeatureFormOpen(true);
  };

  const openFeatureEditForm = (feature: FeatureLibraryRecord) => {
    setFeatureFormMode("edit");
    setEditingFeatureId(feature.id);
    setFeatureFormValues({
      name: feature.name,
      description: feature.description,
    });
    setFeatureFormOpen(true);
  };

  const openMembershipDetail = (membership: MembershipRecord) => {
    setSelectedMembershipId(membership.id);
    setMembershipDetailOpen(true);
  };

  const handlePlanSubmit = async (values: MembershipPlanFormValues) => {
    try {
      setActionError(null);
      setPlanSubmitting(true);

      if (planFormMode === "add") {
        const created = await membershipService.createMembershipPlan(values);
        updatePlanRecord(created);
        setPlanFormOpen(false);
        setSelectedPlanId(created.id);
        setPlanDetailOpen(true);
        return;
      }

      if (!editingPlanId) {
        return;
      }

      const updated = await membershipService.updateMembershipPlan(editingPlanId, values);
      updatePlanRecord(updated);
      setPlanFormOpen(false);
    } catch (error) {
      console.error("Failed to save membership plan", error);
      setActionError(toErrorMessage(error));
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleDisablePlan = async (plan: MembershipPlanRecord) => {
    if (plan.activeMembers > 0) {
      return;
    }

    try {
      setActionError(null);
      setDisablingPlanId(plan.id);
      await membershipService.deleteMembershipPlan(plan.id);
      setPlans((previous) => previous.filter((item) => item.id !== plan.id));

      if (selectedPlanId === plan.id) {
        setPlanDetailOpen(false);
        setSelectedPlanId(null);
      }
    } catch (error) {
      console.error("Failed to disable membership plan", error);
      setActionError(toErrorMessage(error));
    } finally {
      setDisablingPlanId(null);
    }
  };

  const handleDuplicatePlan = async (plan: MembershipPlanRecord) => {
    try {
      setActionError(null);
      const created = await membershipService.createMembershipPlan(getDuplicatedPlanFormValues(plan));
      updatePlanRecord(created);
      setSelectedPlanId(created.id);
      setPlanDetailOpen(true);
    } catch (error) {
      console.error("Failed to duplicate membership plan", error);
      setActionError(toErrorMessage(error));
    }
  };

  const handleFeatureSubmit = async (values: FeatureFormValues) => {
    try {
      setActionError(null);
      setFeatureSubmitting(true);

      if (featureFormMode === "add") {
        const created = await membershipService.createFeature(values);
        updateFeatureRecord(created);
        setFeatureFormOpen(false);
        return;
      }

      if (!editingFeatureId) {
        return;
      }

      const updated = await membershipService.updateFeature(editingFeatureId, values);
      updateFeatureRecord(updated);
      setFeatureFormOpen(false);
    } catch (error) {
      console.error("Failed to save feature", error);
      setActionError(toErrorMessage(error));
    } finally {
      setFeatureSubmitting(false);
    }
  };

  const handleDeleteFeature = async (feature: FeatureLibraryRecord) => {
    if (feature.isSystem || feature.assignedPlans > 0) {
      return;
    }

    try {
      setActionError(null);
      setDeletingFeatureId(feature.id);
      await membershipService.deleteFeature(feature.id);
      setFeatures((previous) => previous.filter((item) => item.id !== feature.id));
    } catch (error) {
      console.error("Failed to delete feature", error);
      setActionError(toErrorMessage(error));
    } finally {
      setDeletingFeatureId(null);
    }
  };

  const handleRenewMembership = async (membership: MembershipRecord, planId: string) => {
    try {
      setActionError(null);
      setMembershipActionSubmitting(true);
      const created = await membershipService.assignMembership({
        memberId: membership.memberId,
        planId,
        startDate: new Date().toISOString(),
      });
      await loadMembershipData();
      setSelectedMembershipId(created.id);
    } catch (error) {
      console.error("Failed to renew membership", error);
      setActionError(toErrorMessage(error));
    } finally {
      setMembershipActionSubmitting(false);
    }
  };

  const handleChangePlan = async (membership: MembershipRecord, newPlanId: string) => {
    try {
      setActionError(null);
      setMembershipActionSubmitting(true);
      const updated = await membershipService.upgradeMembership(membership.memberId, newPlanId);
      await loadMembershipData();
      setSelectedMembershipId(updated.id);
    } catch (error) {
      console.error("Failed to change membership plan", error);
      setActionError(toErrorMessage(error));
    } finally {
      setMembershipActionSubmitting(false);
    }
  };

  const handleToggleFreeze = async (membership: MembershipRecord, shouldFreeze: boolean) => {
    try {
      setActionError(null);
      setMembershipActionSubmitting(true);

      applyOptimisticMembershipStatus(membership.id, shouldFreeze ? "FROZEN" : "ACTIVE");

      const updated = shouldFreeze
        ? await membershipService.freezeMembership(membership.id)
        : await membershipService.unfreezeMembership(membership.id);

      setSelectedMembershipDetail(updated);
      await loadMembershipData();
    } catch (error) {
      console.error("Failed to toggle membership freeze state", error);
      setActionError(toErrorMessage(error));
      await loadMembershipData();
    } finally {
      setMembershipActionSubmitting(false);
    }
  };

  const handleMarkExpired = async (membership: MembershipRecord) => {
    try {
      setActionError(null);
      setMembershipActionSubmitting(true);

      applyOptimisticMembershipStatus(membership.id, "CANCELLED");

      const updated = await membershipService.markMembershipExpired(membership.id);
      setSelectedMembershipDetail(updated);
      await loadMembershipData();
    } catch (error) {
      console.error("Failed to mark membership expired", error);
      setActionError(toErrorMessage(error));
      await loadMembershipData();
    } finally {
      setMembershipActionSubmitting(false);
    }
  };

  const toggleMembershipQuickFilter = (filter: MembershipQuickFilter) => {
    setMembershipFilters((current) => ({
      ...current,
      quickFilter: current.quickFilter === filter ? "all" : filter,
    }));
  };

  const showPlans = view === "plans";
  const showMemberships = view === "memberships";
  const showFeatures = view === "features";

  const pageTitle = showPlans
    ? "Membership Plans Management"
    : showMemberships
      ? "Member Membership List"
      : "Membership Feature Library";

  const pageDescription = showPlans
    ? "Create, update, duplicate, and disable membership plans."
    : showMemberships
      ? "Track memberships, expiry, payment status, and perform operational actions."
      : "Define and maintain reusable feature blocks for membership plans.";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="body-text text-muted-foreground">{pageDescription}</p>
        </div>

        <div className="hidden gap-2 md:flex">
          {showFeatures ? (
            <Button type="button" variant="outline" onClick={openFeatureAddForm}>
              <MaterialIcon icon="auto_awesome" className="text-lg" />
              <span>Add Feature</span>
            </Button>
          ) : null}
          {showPlans ? (
            <Button type="button" onClick={openAddPlanForm}>
              <MaterialIcon icon="add" className="text-lg" />
              <span>Add Plan</span>
            </Button>
          ) : null}
        </div>
      </header>

      {loadState === "loading" ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading membership data...</CardContent>
        </Card>
      ) : null}

      {loadState === "error" ? (
        <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-base font-bold text-destructive">Unable to load membership data.</p>
            <div>
              <Button type="button" variant="secondary" onClick={() => void loadMembershipData()}>
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
          {showMemberships ? (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="section-title">Membership Overview</h2>
                <div className="flex items-center gap-3">
                  <label htmlFor="revenue-window" className="text-xs font-bold text-muted-foreground">
                    Revenue Window
                  </label>
                  <Select
                    id="revenue-window"
                    value={String(revenuePeriodDays)}
                    onChange={(event) => setRevenuePeriodDays(Number(event.target.value))}
                    className="w-[160px]"
                  >
                    {REVENUE_PERIOD_OPTIONS.map((period) => (
                      <option key={period} value={period}>
                        Last {period} Days
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <MembershipOverviewKpis
                metrics={overviewMetrics}
                activeFilter={membershipFilters.quickFilter}
                onFilterChange={toggleMembershipQuickFilter}
                revenuePeriodDays={revenuePeriodDays}
              />
            </section>
          ) : null}

          {showPlans ? (
            <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="section-title">Membership Plans Registry</h2>
              {!isMobile ? (
                <Button type="button" onClick={openAddPlanForm}>
                  <MaterialIcon icon="add" className="text-lg" />
                  <span>Add Plan</span>
                </Button>
              ) : null}
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <label htmlFor="plan-search" className="sr-only">
                    Search by plan name
                  </label>
                  <Input
                    id="plan-search"
                    placeholder="Search by plan name"
                    value={planFilters.search}
                    onChange={(event) =>
                      setPlanFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                </div>

                {isMobile ? (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setPlanFiltersMobileOpen(true)}>
                      <MaterialIcon icon="filter_list" className="text-lg" />
                      <span>Filters</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!hasActivePlanFilters}
                      onClick={() => setPlanFilters(defaultPlanFilters)}
                    >
                      Reset
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={planFilters.status}
                      onChange={(event) =>
                        setPlanFilters((current) => ({
                          ...current,
                          status: event.target.value as MembershipPlanFilterState["status"],
                        }))
                      }
                      className="w-[160px]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>

                    <Select
                      value={planFilters.sort}
                      onChange={(event) =>
                        setPlanFilters((current) => ({
                          ...current,
                          sort: event.target.value as MembershipPlanFilterState["sort"],
                        }))
                      }
                      className="w-[180px]"
                    >
                      <option value="popularity_desc">Most Popular</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!hasActivePlanFilters}
                      onClick={() => setPlanFilters(defaultPlanFilters)}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            </div>

            {filteredPlans.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No plans found with current filters.
                </CardContent>
              </Card>
            ) : (
              <MembershipPlansTable
                plans={filteredPlans}
                onView={openPlanDetail}
                onEdit={openEditPlanForm}
                onDisable={(plan) => void handleDisablePlan(plan)}
                disablingPlanId={disablingPlanId}
              />
            )}
            </section>
          ) : null}

          {showMemberships ? (
            <section className="space-y-4">
            <h2 className="section-title">Member Membership List</h2>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <label htmlFor="membership-search" className="sr-only">
                    Search by member name
                  </label>
                  <Input
                    id="membership-search"
                    placeholder="Search by member name"
                    value={membershipFilters.search}
                    onChange={(event) =>
                      setMembershipFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                </div>

                {isMobile ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMembershipFiltersMobileOpen(true)}
                    >
                      <MaterialIcon icon="filter_list" className="text-lg" />
                      <span>Filters</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!hasActiveMembershipFilters}
                      onClick={() => setMembershipFilters(defaultMembershipFilters)}
                    >
                      Reset
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={membershipFilters.status}
                      onChange={(event) =>
                        setMembershipFilters((current) => ({
                          ...current,
                          status: event.target.value as MembershipFilterState["status"],
                        }))
                      }
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="expiring_soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                      <option value="frozen">Frozen</option>
                      <option value="pending">Pending</option>
                    </Select>

                    <Select
                      value={membershipFilters.planId}
                      onChange={(event) =>
                        setMembershipFilters((current) => ({
                          ...current,
                          planId: event.target.value,
                        }))
                      }
                    >
                      <option value="all">All Plans</option>
                      {planRecords.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </Select>

                    <Input
                      type="date"
                      value={membershipFilters.expiryFrom}
                      onChange={(event) =>
                        setMembershipFilters((current) => ({
                          ...current,
                          expiryFrom: event.target.value,
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={membershipFilters.expiryTo}
                      onChange={(event) =>
                        setMembershipFilters((current) => ({
                          ...current,
                          expiryTo: event.target.value,
                        }))
                      }
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!hasActiveMembershipFilters}
                      onClick={() => setMembershipFilters(defaultMembershipFilters)}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            </div>

            {filteredMemberships.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No memberships found with current filters.
                </CardContent>
              </Card>
            ) : (
              <MemberMembershipTable
                memberships={filteredMemberships}
                sort={membershipFilters.sort}
                onSortChange={() =>
                  setMembershipFilters((current) => ({
                    ...current,
                    sort: current.sort === "expiry_asc" ? "expiry_desc" : "expiry_asc",
                  }))
                }
                onView={openMembershipDetail}
              />
            )}
            </section>
          ) : null}

          {showFeatures ? (
            <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="section-title">Membership Feature Library</h2>
              {!isMobile ? (
                <Button type="button" variant="outline" onClick={openFeatureAddForm}>
                  <MaterialIcon icon="add" className="text-lg" />
                  <span>Add Feature</span>
                </Button>
              ) : null}
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <label htmlFor="feature-search" className="sr-only">
                    Search features
                  </label>
                  <Input
                    id="feature-search"
                    placeholder="Search by feature name"
                    value={featureFilters.search}
                    onChange={(event) =>
                      setFeatureFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                  />
                </div>

                {isMobile ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFeatureFiltersMobileOpen(true)}
                    >
                      <MaterialIcon icon="filter_list" className="text-lg" />
                      <span>Filters</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!hasActiveFeatureFilters}
                      onClick={() => setFeatureFilters(defaultFeatureFilters)}
                    >
                      Reset
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={featureFilters.status}
                      onChange={(event) =>
                        setFeatureFilters((current) => ({
                          ...current,
                          status: event.target.value as FeatureFilterState["status"],
                        }))
                      }
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!hasActiveFeatureFilters}
                      onClick={() => setFeatureFilters(defaultFeatureFilters)}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            </div>

            {filteredFeatures.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No features found with current filters.
                </CardContent>
              </Card>
            ) : (
              <FeatureLibraryTable
                features={filteredFeatures}
                deletingFeatureId={deletingFeatureId}
                onEdit={openFeatureEditForm}
                onDelete={(feature) => void handleDeleteFeature(feature)}
              />
            )}
            </section>
          ) : null}

          {isMobile && (showPlans || showFeatures) ? (
            <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
              {showFeatures ? (
                <Button type="button" variant="outline" onClick={openFeatureAddForm} className="shadow-lg backdrop-blur-md bg-background/80">
                  <MaterialIcon icon="auto_awesome" className="text-lg" />
                  <span>Feature</span>
                </Button>
              ) : null}
              {showPlans ? (
                <Button type="button" onClick={openAddPlanForm} className="shadow-lg">
                  <MaterialIcon icon="add" className="text-lg" />
                  <span>Plan</span>
                </Button>
              ) : null}
            </div>
          ) : null}

          {showPlans && isMobile && planFiltersMobileOpen ? (
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                aria-label="Close plan filters"
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setPlanFiltersMobileOpen(false)}
              />
              <section className="absolute inset-x-0 bottom-0 rounded-t-xl border-t bg-background p-4 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">Plan Filters</h3>
                  <Button type="button" variant="ghost" onClick={() => setPlanFiltersMobileOpen(false)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-plan-status">Status</Label>
                    <Select
                      id="mobile-plan-status"
                      value={planFilters.status}
                      onChange={(event) =>
                        setPlanFilters((current) => ({
                          ...current,
                          status: event.target.value as MembershipPlanFilterState["status"],
                        }))
                      }
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile-plan-sort">Sort</Label>
                    <Select
                      id="mobile-plan-sort"
                      value={planFilters.sort}
                      onChange={(event) =>
                        setPlanFilters((current) => ({
                          ...current,
                          sort: event.target.value as MembershipPlanFilterState["sort"],
                        }))
                      }
                    >
                      <option value="popularity_desc">Most Popular</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={!hasActivePlanFilters}
                    onClick={() => setPlanFilters(defaultPlanFilters)}
                  >
                    Clear
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setPlanFiltersMobileOpen(false)}>
                    Apply
                  </Button>
                </div>
              </section>
            </div>
          ) : null}

          {showMemberships && isMobile && membershipFiltersMobileOpen ? (
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                aria-label="Close membership filters"
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setMembershipFiltersMobileOpen(false)}
              />
              <section className="absolute inset-x-0 bottom-0 rounded-t-xl border-t bg-background p-4 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">Membership Filters</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMembershipFiltersMobileOpen(false)}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-membership-status">Status</Label>
                    <Select
                      id="mobile-membership-status"
                      value={membershipFilters.status}
                      onChange={(event) =>
                        setMembershipFilters((current) => ({
                          ...current,
                          status: event.target.value as MembershipFilterState["status"],
                        }))
                      }
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="expiring_soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                      <option value="frozen">Frozen</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile-membership-plan">Plan</Label>
                    <Select
                      id="mobile-membership-plan"
                      value={membershipFilters.planId}
                      onChange={(event) =>
                        setMembershipFilters((current) => ({
                          ...current,
                          planId: event.target.value,
                        }))
                      }
                    >
                      <option value="all">All Plans</option>
                      {planRecords.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-expiry-from">Expiry From</Label>
                      <Input
                        id="mobile-expiry-from"
                        type="date"
                        value={membershipFilters.expiryFrom}
                        onChange={(event) =>
                          setMembershipFilters((current) => ({
                            ...current,
                            expiryFrom: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-expiry-to">Expiry To</Label>
                      <Input
                        id="mobile-expiry-to"
                        type="date"
                        value={membershipFilters.expiryTo}
                        onChange={(event) =>
                          setMembershipFilters((current) => ({
                            ...current,
                            expiryTo: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={!hasActiveMembershipFilters}
                    onClick={() => setMembershipFilters(defaultMembershipFilters)}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setMembershipFiltersMobileOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </section>
            </div>
          ) : null}

          {showFeatures && isMobile && featureFiltersMobileOpen ? (
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                aria-label="Close feature filters"
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setFeatureFiltersMobileOpen(false)}
              />
              <section className="absolute inset-x-0 bottom-0 rounded-t-xl border-t bg-background p-4 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">Feature Filters</h3>
                  <Button type="button" variant="ghost" onClick={() => setFeatureFiltersMobileOpen(false)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-feature-status">Status</Label>
                    <Select
                      id="mobile-feature-status"
                      value={featureFilters.status}
                      onChange={(event) =>
                        setFeatureFilters((current) => ({
                          ...current,
                          status: event.target.value as FeatureFilterState["status"],
                        }))
                      }
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={!hasActiveFeatureFilters}
                    onClick={() => setFeatureFilters(defaultFeatureFilters)}
                  >
                    Clear
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setFeatureFiltersMobileOpen(false)}>
                    Apply
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      {showPlans ? (
        <>
          <MembershipPlanDetailDrawer
            open={planDetailOpen}
            plan={selectedPlan}
            assignedMemberships={selectedPlanMemberships}
            isMobile={isMobile}
            isSubmitting={Boolean(disablingPlanId)}
            onClose={() => setPlanDetailOpen(false)}
            onEdit={openEditPlanForm}
            onDuplicate={(plan) => void handleDuplicatePlan(plan)}
            onDeactivate={(plan) => void handleDisablePlan(plan)}
          />

          <MembershipPlanFormDrawer
            open={planFormOpen}
            isMobile={isMobile}
            mode={planFormMode}
            initialValues={planFormValues}
            features={featureRecords}
            isSubmitting={planSubmitting}
            onClose={() => setPlanFormOpen(false)}
            onSubmit={(values) => void handlePlanSubmit(values)}
          />
        </>
      ) : null}

      {showFeatures ? (
        <FeatureFormDrawer
          open={featureFormOpen}
          isMobile={isMobile}
          mode={featureFormMode}
          initialValues={featureFormValues}
          isSubmitting={featureSubmitting}
          onClose={() => setFeatureFormOpen(false)}
          onSubmit={(values) => void handleFeatureSubmit(values)}
        />
      ) : null}

      {showMemberships ? (
        <MembershipDetailDrawer
          open={membershipDetailOpen}
          membership={selectedMembership}
          detail={selectedMembershipDetail}
          plans={planRecords}
          paymentHistory={selectedMembershipPayments}
          membershipHistory={selectedMembershipHistory}
          isMobile={isMobile}
          isSubmitting={membershipActionSubmitting}
          detailLoading={membershipDetailLoading}
          onClose={() => setMembershipDetailOpen(false)}
          onRenew={(membership, planId) => void handleRenewMembership(membership, planId)}
          onChangePlan={(membership, newPlanId) => void handleChangePlan(membership, newPlanId)}
          onToggleFreeze={(membership, shouldFreeze) =>
            void handleToggleFreeze(membership, shouldFreeze)
          }
          onMarkExpired={(membership) => void handleMarkExpired(membership)}
        />
      ) : null}
    </div>
  );
}
