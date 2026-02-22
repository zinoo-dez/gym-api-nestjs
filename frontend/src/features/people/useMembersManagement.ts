import { useCallback, useEffect, useMemo, useState } from "react";
import { peopleService } from "@/services/people.service";
import {
  AttendanceRecord,
  AttendanceReport,
  DEFAULT_MEMBER_FORM_VALUES,
  MEMBER_DEFAULT_FILTERS,
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
} from ".";

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

export function useMembersManagement() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [payments, setPayments] = useState<MemberPaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<
    MembershipPlanOption[]
  >([]);

  const [filters, setFilters] = useState<MemberFilterState>(
    MEMBER_DEFAULT_FILTERS,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [detailMember, setDetailMember] = useState<MemberProfile | null>(null);
  const [detailAttendance, setDetailAttendance] = useState<AttendanceRecord[]>(
    [],
  );
  const [detailReport, setDetailReport] = useState<AttendanceReport | null>(
    null,
  );
  const [detailProgress, setDetailProgress] = useState<MemberProgressRecord[]>(
    [],
  );
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
      const [memberRows, paymentRows, attendanceRows, planRows] =
        await Promise.all([
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

  const filteredRows = useMemo(
    () => applyMemberFilters(memberRows, filters),
    [filters, memberRows],
  );

  const memberStatusOptions = useMemo(
    () => extractMemberStatusOptions(memberRows),
    [memberRows],
  );

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

  const updateMemberActiveState = useCallback(
    (memberId: string, isActive: boolean) => {
      setMembers((previous) =>
        previous.map((member) =>
          member.id === memberId ? { ...member, isActive } : member,
        ),
      );
      setDetailMember((current) =>
        current?.id === memberId ? { ...current, isActive } : current,
      );
    },
    [],
  );

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
              subscription.id === subscriptionId
                ? { ...subscription, status }
                : subscription,
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
            subscription.id === subscriptionId
              ? { ...subscription, status }
              : subscription,
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
        sort:
          current.sort === "activity_desc" ? "activity_asc" : "activity_desc",
      };
    });
  };

  const handleFormSubmit = async (values: MemberFormValues) => {
    try {
      setActionError(null);
      setActionSubmitting(true);

      if (formMode === "add") {
        const created = await peopleService.createMember(
          peopleService.toMemberCreatePayload(values),
        );
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
        previous.map((member) =>
          member.id === updated.id ? { ...member, ...updated } : member,
        ),
      );

      setDetailMember((current) =>
        current?.id === updated.id ? updated : current,
      );
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
        await peopleService.freezeMembership(
          selectedMemberRow.currentSubscriptionId,
        );
      } else {
        await peopleService.unfreezeMembership(
          selectedMemberRow.currentSubscriptionId,
        );
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

  const handleToggleActive = async (
    member: MemberProfile,
    shouldActivate: boolean,
  ) => {
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
  const sortDirection = (filters.sort.endsWith("asc") ? "asc" : "desc") as
    | "asc"
    | "desc";

  return {
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
  };
}
