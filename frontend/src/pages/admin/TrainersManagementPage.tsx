import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  ManagementDataTable,
  ManagementFilterShell,
  ManagementStatCard,
  StatusBadge,
  TrainerDetailPanel,
  TrainerFormPanel,
} from "@/components/features/people";
import { useIsMobile } from "@/hooks/useIsMobile";
import { peopleService } from "@/services/people.service";
import {
  BookableMemberOption,
  DEFAULT_TRAINER_FORM_VALUES,
  TRAINER_DEFAULT_FILTERS,
  TRAINER_SORT_OPTIONS,
  TrainerClassScheduleRecord,
  TrainerFilterState,
  TrainerFormValues,
  TrainerInstructorProfile,
  TrainerListRecord,
  TrainerProfile,
  TrainerSessionRecord,
  applyTrainerFilters,
  buildTrainerAssignedMembers,
  buildTrainerFormValuesFromProfile,
  buildTrainerListRecords,
  buildTrainerPerformanceSummary,
  calculateTrainerOverviewMetrics,
  formatDisplayDate,
  formatDisplayDateTime,
  splitCommaSeparatedValues,
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

  return "Unable to complete trainer request.";
};

type LoadState = "loading" | "error" | "ready";
type TrainerQuickFilter = "all" | "active" | "assigned" | "sessions";

export function TrainersManagementPage() {
  const isMobile = useIsMobile();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [sessions, setSessions] = useState<TrainerSessionRecord[]>([]);
  const [classSchedules, setClassSchedules] = useState<TrainerClassScheduleRecord[]>([]);
  const [bookableMembers, setBookableMembers] = useState<BookableMemberOption[]>([]);

  const [filters, setFilters] = useState<TrainerFilterState>(TRAINER_DEFAULT_FILTERS);
  const [quickFilter, setQuickFilter] = useState<TrainerQuickFilter>("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [detailTrainer, setDetailTrainer] = useState<TrainerProfile | null>(null);
  const [instructorProfile, setInstructorProfile] = useState<TrainerInstructorProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formInitialValues, setFormInitialValues] = useState<TrainerFormValues>(
    DEFAULT_TRAINER_FORM_VALUES,
  );
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);

  const [actionSubmitting, setActionSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoadState("loading");

    try {
      const [trainerRows, trainerSessions, scheduleRows, memberOptions] = await Promise.all([
        peopleService.listTrainers(),
        peopleService.listTrainerSessions(),
        peopleService.listTrainerClassSchedules(),
        peopleService.listBookableMembers(),
      ]);

      setTrainers(trainerRows);
      setSessions(trainerSessions);
      setClassSchedules(scheduleRows);
      setBookableMembers(memberOptions);
      setActionError(null);
      setLoadState("ready");
    } catch (error) {
      console.error("Failed to load trainers management data", error);
      setActionError(toErrorMessage(error));
      setLoadState("error");
    }
  }, []);

  const loadTrainerDetail = useCallback(async (trainerId: string) => {
    setDetailLoading(true);

    try {
      const [trainer, profile] = await Promise.all([
        peopleService.getTrainerById(trainerId),
        peopleService.getInstructorProfile(trainerId).catch(() => null),
      ]);

      setDetailTrainer(trainer);
      setInstructorProfile(profile);
      setActionError(null);
    } catch (error) {
      console.error("Failed to load trainer detail", error);
      setActionError(toErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!detailOpen || !selectedTrainerId) {
      setDetailTrainer(null);
      setInstructorProfile(null);
      return;
    }

    void loadTrainerDetail(selectedTrainerId);
  }, [detailOpen, loadTrainerDetail, selectedTrainerId]);

  const trainerRows = useMemo(() => buildTrainerListRecords(trainers, sessions), [sessions, trainers]);

  const metrics = useMemo(() => calculateTrainerOverviewMetrics(trainerRows), [trainerRows]);

  const filteredRows = useMemo(() => applyTrainerFilters(trainerRows, filters), [filters, trainerRows]);

  const quickFilteredRows = useMemo(() => {
    switch (quickFilter) {
      case "active":
        return filteredRows.filter((row) => row.isActive);
      case "assigned":
        return filteredRows.filter((row) => row.assignedMembers > 0);
      case "sessions":
        return filteredRows.filter((row) => row.sessionsThisMonth > 0);
      case "all":
      default:
        return filteredRows;
    }
  }, [filteredRows, quickFilter]);

  const selectedTrainerRow = useMemo(
    () => trainerRows.find((row) => row.id === selectedTrainerId) ?? null,
    [selectedTrainerId, trainerRows],
  );

  const selectedTrainerBase = useMemo(
    () => trainers.find((trainer) => trainer.id === selectedTrainerId) ?? null,
    [selectedTrainerId, trainers],
  );

  const detailTrainerRecord = detailTrainer ?? selectedTrainerBase;

  const selectedAssignedMembers = useMemo(
    () =>
      selectedTrainerId ? buildTrainerAssignedMembers(selectedTrainerId, sessions) : [],
    [selectedTrainerId, sessions],
  );

  const selectedSessionSchedule = useMemo(
    () =>
      sessions
        .filter((session) => session.trainerId === selectedTrainerId)
        .sort((left, right) => (left.sessionDate > right.sessionDate ? 1 : -1)),
    [selectedTrainerId, sessions],
  );

  const selectedClassSchedule = useMemo(
    () =>
      classSchedules
        .filter((schedule) => schedule.trainerId === selectedTrainerId)
        .sort((left, right) => (left.schedule > right.schedule ? 1 : -1)),
    [classSchedules, selectedTrainerId],
  );

  const performanceSummary = useMemo(
    () =>
      selectedTrainerId
        ? buildTrainerPerformanceSummary(selectedTrainerId, sessions)
        : {
            totalSessions: 0,
            completedSessions: 0,
            completionRate: 0,
            averageSessionDuration: 0,
            averageSessionRate: 0,
          },
    [selectedTrainerId, sessions],
  );

  const hasActiveFilters =
    filters.search !== TRAINER_DEFAULT_FILTERS.search ||
    filters.activeStatus !== TRAINER_DEFAULT_FILTERS.activeStatus ||
    filters.sort !== TRAINER_DEFAULT_FILTERS.sort ||
    quickFilter !== "all";

  const updateTrainerState = useCallback((trainerId: string, updates: Partial<TrainerProfile>) => {
    setTrainers((previous) =>
      previous.map((trainer) => (trainer.id === trainerId ? { ...trainer, ...updates } : trainer)),
    );
    setDetailTrainer((current) => (current?.id === trainerId ? { ...current, ...updates } : current));
  }, []);

  const openTrainerDetail = (row: TrainerListRecord) => {
    setSelectedTrainerId(row.id);
    setDetailOpen(true);
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingTrainerId(null);
    setFormInitialValues(DEFAULT_TRAINER_FORM_VALUES);
    setFormOpen(true);
  };

  const openEditForm = (trainer: TrainerProfile) => {
    setFormMode("edit");
    setEditingTrainerId(trainer.id);
    setFormInitialValues(buildTrainerFormValuesFromProfile(trainer));
    setFormOpen(true);
  };

  const clearFilters = () => {
    setFilters(TRAINER_DEFAULT_FILTERS);
    setQuickFilter("all");
  };

  const handleFormSubmit = async (values: TrainerFormValues) => {
    try {
      setActionError(null);
      setActionSubmitting(true);

      const specializations = splitCommaSeparatedValues(values.specializations);
      const certifications = splitCommaSeparatedValues(values.certifications);

      if (formMode === "add") {
        const created = await peopleService.createTrainer(
          peopleService.toTrainerCreatePayload({
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            address: values.address,
            avatarUrl: values.avatarUrl,
            specializations,
            certifications,
            experience: values.experience,
            hourlyRate: values.hourlyRate,
          }),
        );

        setTrainers((previous) => [created, ...previous]);
        setFormOpen(false);
        setSelectedTrainerId(created.id);
        setDetailOpen(true);
        return;
      }

      if (!editingTrainerId) {
        return;
      }

      const updated = await peopleService.updateTrainer(
        editingTrainerId,
        peopleService.toTrainerUpdatePayload({
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          avatarUrl: values.avatarUrl,
          specializations,
          certifications,
          experience: values.experience,
          hourlyRate: values.hourlyRate,
        }),
      );

      setTrainers((previous) =>
        previous.map((trainer) => (trainer.id === updated.id ? { ...trainer, ...updated } : trainer)),
      );
      setDetailTrainer((current) => (current?.id === updated.id ? updated : current));
      setFormOpen(false);
    } catch (error) {
      console.error("Failed to save trainer", error);
      setActionError(toErrorMessage(error));
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAssignMember = async (values: {
    memberId: string;
    sessionDate: string;
    duration: number;
    title: string;
    description: string;
    notes: string;
    rate: number;
  }) => {
    if (!selectedTrainerId) {
      return;
    }

    try {
      setActionError(null);
      setActionSubmitting(true);

      const created = await peopleService.createTrainerSession({
        memberId: values.memberId,
        trainerId: selectedTrainerId,
        sessionDate: new Date(values.sessionDate).toISOString(),
        duration: values.duration,
        title: values.title,
        description: values.description || undefined,
        notes: values.notes || undefined,
        rate: values.rate,
      });

      setSessions((previous) => [created, ...previous]);
    } catch (error) {
      console.error("Failed to assign member to trainer", error);
      setActionError(toErrorMessage(error));
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRemoveMember = async (assignment: { memberName: string; sessionIds: string[] }) => {
    if (assignment.sessionIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(`Remove ${assignment.memberName} from this trainer's assignment roster?`);
    if (!confirmed) {
      return;
    }

    try {
      setActionError(null);
      setActionSubmitting(true);

      const completedSessions = await Promise.all(
        assignment.sessionIds.map((sessionId) => peopleService.completeTrainerSession(sessionId)),
      );

      setSessions((previous) =>
        previous.map((session) => {
          const completed = completedSessions.find((item) => item.id === session.id);
          return completed ?? session;
        }),
      );
    } catch (error) {
      console.error("Failed to remove trainer assignment", error);
      setActionError(toErrorMessage(error));
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleToggleActive = async (trainer: TrainerProfile, shouldActivate: boolean) => {
    if (shouldActivate) {
      setActionError("Activate action is unavailable because the trainer API currently exposes deactivation only.");
      return;
    }

    const confirmed = window.confirm("Deactivate this trainer account?");
    if (!confirmed) {
      return;
    }

    try {
      setActionError(null);
      setActionSubmitting(true);

      updateTrainerState(trainer.id, { isActive: false });
      await peopleService.deactivateTrainer(trainer.id);
    } catch (error) {
      console.error("Failed to deactivate trainer", error);
      setActionError(toErrorMessage(error));
      await loadData();
      if (selectedTrainerId === trainer.id) {
        await loadTrainerDetail(trainer.id);
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Trainers Management</h1>
          <p className="body-text text-muted-foreground">
            Manage trainer workload, assigned members, schedule visibility, and performance indicators.
          </p>
        </div>
        <Button type="button" onClick={openAddForm}>
          <MaterialIcon icon="add" className="text-lg" />
          <span>Add Trainer</span>
        </Button>
      </header>

      {loadState === "loading" ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading trainers...</CardContent>
        </Card>
      ) : null}

      {loadState === "error" ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-danger">Unable to load trainer data.</p>
            <div>
              <Button type="button" variant="outlined" onClick={() => void loadData()}>
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
          <section className="space-y-4">
            <h2 className="section-title">Trainer Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ManagementStatCard
                title="Total Trainers"
                value={metrics.totalTrainers}
                tone="info"
                active={quickFilter === "all"}
                onClick={() => setQuickFilter("all")}
                icon="group"
              />
              <ManagementStatCard
                title="Active Trainers"
                value={metrics.activeTrainers}
                tone="success"
                active={quickFilter === "active"}
                onClick={() => setQuickFilter((value) => (value === "active" ? "all" : "active"))}
                icon="how_to_reg"
              />
              <ManagementStatCard
                title="Assigned Members"
                value={metrics.assignedMembers}
                tone="warning"
                active={quickFilter === "assigned"}
                onClick={() =>
                  setQuickFilter((value) => (value === "assigned" ? "all" : "assigned"))
                }
                icon="how_to_reg"
              />
              <ManagementStatCard
                title="Sessions This Month"
                value={metrics.sessionsThisMonth}
                tone="secondary"
                active={quickFilter === "sessions"}
                onClick={() => setQuickFilter((value) => (value === "sessions" ? "all" : "sessions"))}
                icon="event_note"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="section-title">Trainer Directory</h2>

            <ManagementFilterShell
              searchValue={filters.search}
              onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
              searchPlaceholder="Search by trainer name or specialization"
              hasActiveFilters={hasActiveFilters}
              onReset={clearFilters}
              isMobile={isMobile}
              mobileOpen={mobileFiltersOpen}
              onMobileOpenChange={setMobileFiltersOpen}
              mobileTitle="Trainer Filters"
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="trainer-filter-active">Active Status</Label>
                  <Select
                    id="trainer-filter-active"
                    value={filters.activeStatus}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        activeStatus: event.target.value as TrainerFilterState["activeStatus"],
                      }))
                    }
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="trainer-filter-sort">Sort By</Label>
                  <Select
                    id="trainer-filter-sort"
                    value={filters.sort}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        sort: event.target.value as TrainerFilterState["sort"],
                      }))
                    }
                  >
                    {TRAINER_SORT_OPTIONS.map((option) => (
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
              onRowClick={openTrainerDetail}
              emptyTitle="No trainers found"
              emptyDescription="Try adjusting search and filter criteria."
              columns={[
                {
                  id: "name",
                  label: "Trainer Name",
                  render: (row) => (
                    <div>
                      <p className="font-medium text-foreground">{row.fullName}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  ),
                },
                {
                  id: "specialization",
                  label: "Specialization",
                  render: (row) => <span className="text-foreground">{row.specialization}</span>,
                },
                {
                  id: "assignedMembers",
                  label: "Assigned Members",
                  align: "right",
                  render: (row) => <span className="text-foreground">{row.assignedMembers}</span>,
                },
                {
                  id: "status",
                  label: "Active Status",
                  render: (row) => <StatusBadge value={row.isActive ? "ACTIVE" : "INACTIVE"} />,
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
                    const trainer = trainers.find((item) => item.id === row.id);

                    return (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="text"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTrainerDetail(row);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="text"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (trainer) {
                              openEditForm(trainer);
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          size="sm"
                          className="text-error border-error/20 hover:bg-error/5"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (trainer) {
                              void handleToggleActive(trainer, false);
                            }
                          }}
                          disabled={!trainer?.isActive}
                        >
                          Deactivate
                        </Button>
                      </div>
                    );
                  },
                },
              ]}
              mobileCard={(row) => {
                const trainer = trainers.find((item) => item.id === row.id);

                return (
                  <article className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-foreground">{row.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{row.specialization}</p>
                      </div>
                      <StatusBadge value={row.isActive ? "ACTIVE" : "INACTIVE"} />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned</dt>
                        <dd className="text-foreground">{row.assignedMembers}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sessions</dt>
                        <dd className="text-foreground">{row.sessionsThisMonth}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Join Date</dt>
                        <dd className="text-foreground">{formatDisplayDate(row.joinDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workload</dt>
                        <dd className="text-foreground">{row.workload}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" variant="text" size="sm" onClick={() => openTrainerDetail(row)}>
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        size="sm"
                        onClick={() => {
                          if (trainer) {
                            openEditForm(trainer);
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        className="text-error border-error/20 hover:bg-error/5"
                        onClick={() => {
                          if (trainer) {
                            void handleToggleActive(trainer, false);
                          }
                        }}
                        disabled={!trainer?.isActive}
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

      <TrainerDetailPanel
        open={detailOpen}
        isMobile={isMobile}
        onClose={() => setDetailOpen(false)}
        trainer={detailTrainerRecord}
        trainerRow={selectedTrainerRow}
        assignedMembers={selectedAssignedMembers}
        sessionSchedule={selectedSessionSchedule}
        classSchedule={selectedClassSchedule}
        instructorProfile={instructorProfile}
        performanceSummary={performanceSummary}
        bookableMembers={bookableMembers}
        loading={detailLoading}
        actionSubmitting={actionSubmitting}
        activationSupported={false}
        onEdit={() => {
          if (detailTrainerRecord) {
            openEditForm(detailTrainerRecord);
          }
        }}
        onAssignMember={(values) => void handleAssignMember(values)}
        onRemoveMember={(assignment) => void handleRemoveMember(assignment)}
        onToggleActive={(shouldActivate) => {
          if (detailTrainerRecord) {
            void handleToggleActive(detailTrainerRecord, shouldActivate);
          }
        }}
      />

      <TrainerFormPanel
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
