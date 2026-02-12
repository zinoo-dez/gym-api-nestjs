import * as React from "react";
import { AdminLayout } from "../../layouts";
import {
  PrimaryButton,
  SecondaryButton,
  FormInput,
  Modal,
} from "@/components/gym";
import { DataPagination } from "@/components/gym/data-pagination";
import { cn } from "@/lib/utils";
import {
  membersService,
  type Member,
  type CreateMemberRequest,
  type UpdateMemberRequest,
} from "@/services/members.service";
import {
  membershipsService,
  type MembershipPlan,
} from "@/services/memberships.service";
import { FormModal } from "@/components/gym/form-modal";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import { usePagination } from "@/hooks/usePagination";
import { toast } from "sonner";
import { Snowflake, Play, Ban } from "lucide-react";

export default function AdminMembersPage() {
  const pagination = usePagination(10);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [planFilter, setPlanFilter] = React.useState("all");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(
    null,
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<CreateMemberRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });
  const [editForm, setEditForm] = React.useState<UpdateMemberRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      pagination.setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        };

        if (debouncedSearch) {
          params.name = debouncedSearch;
        }

        if (statusFilter !== "all") {
          params.isActive = statusFilter === "active";
        }

        if (planFilter !== "all") {
          params.planId = planFilter;
        }

        const [membersResponse, plansResponse] = await Promise.all([
          membersService.getAll(params),
          membershipsService.getAllPlans({ limit: 100 }),
        ]);

        setMembers(
          Array.isArray(membersResponse.data) ? membersResponse.data : [],
        );
        pagination.setTotal(membersResponse.total || 0);
        setPlans(Array.isArray(plansResponse.data) ? plansResponse.data : []);
      } catch (err) {
        console.error("Error loading members:", err);
        setError("Failed to load members.");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    statusFilter,
    planFilter,
  ]);

  const openCreate = () => {
    setCreateForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || "",
      dateOfBirth: member.dateOfBirth
        ? new Date(member.dateOfBirth).toISOString().split("T")[0]
        : "",
    });
    setIsEditOpen(true);
  };

  const openView = (member: Member) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const openDelete = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      const payload: CreateMemberRequest = {
        ...createForm,
        phone: createForm.phone?.trim() || undefined,
        dateOfBirth: createForm.dateOfBirth || undefined,
      };
      const created = await membersService.create(payload);
      setMembers((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      toast.success("Member created successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to create member.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMember) return;
    setIsSaving(true);
    try {
      const payload: UpdateMemberRequest = {
        ...editForm,
        phone: editForm.phone?.trim() || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
      };
      const updated = await membersService.update(selectedMember.id, payload);
      setMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      );
      setIsEditOpen(false);
      setSelectedMember(null);
      toast.success("Member updated successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update member.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    setIsDeleting(true);
    try {
      await membersService.deactivate(selectedMember.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, isActive: false } : m,
        ),
      );
      toast.success("Member deactivated");
      setIsDeleteOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to deactivate member.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 1000,
      };
      if (debouncedSearch) {
        params.name = debouncedSearch;
      }
      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active";
      }
      if (planFilter !== "all") {
        params.planId = planFilter;
      }
      const response = await membersService.getAll(params);
      const rows = (Array.isArray(response.data) ? response.data : []).map(
        (member) => {
          const subscription = member.subscriptions?.[0];
          return {
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone || "",
            isActive: member.isActive ? "active" : "inactive",
            plan: subscription?.membershipPlan?.name || "No Plan",
            planStatus: subscription?.status || "",
            joined: new Date(member.createdAt).toLocaleDateString(),
          };
        },
      );

      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Status",
        "Plan",
        "Plan Status",
        "Joined",
      ];
      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          [
            row.firstName,
            row.lastName,
            row.email,
            row.phone,
            row.isActive,
            row.plan,
            row.planStatus,
            row.joined,
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `members-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export members.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Members Management
            </h1>
            <p className="text-muted-foreground">
              Manage all gym members and their memberships.
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Member
          </PrimaryButton>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                pagination.setPage(1);
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select> */}

            {/* Plan Filter 
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                pagination.setPage(1);
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>*/}

            <SecondaryButton variant="ghost" onClick={handleExport}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Export
            </SecondaryButton>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30 border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Member
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Contact
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Plan
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Joined
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Last Visit
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Visits
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading members...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-destructive"
                    >
                      {error}
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No members found.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-foreground text-sm">
                            {member.email}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {member.phone || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {member.subscriptions &&
                        member.subscriptions.length > 0 ? (
                          <div>
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                member.subscriptions[0].status === "ACTIVE" &&
                                  "bg-primary/10 text-primary",
                                member.subscriptions[0].status === "EXPIRED" &&
                                  "bg-yellow-500/10 text-yellow-400",
                                member.subscriptions[0].status ===
                                  "CANCELLED" && "bg-red-500/10 text-red-400",
                                member.subscriptions[0].status === "FROZEN" &&
                                  "bg-blue-500/10 text-blue-400",
                              )}
                            >
                              {member.subscriptions[0].membershipPlan?.name ||
                                "Unknown Plan"}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {member.subscriptions[0].status === "ACTIVE"
                                ? `Expires ${new Date(member.subscriptions[0].endDate).toLocaleDateString()}`
                                : member.subscriptions[0].status}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No Plan
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            member.isActive && "bg-green-500/10 text-green-400",
                            !member.isActive &&
                              "bg-yellow-500/10 text-yellow-400",
                          )}
                        >
                          {member.isActive ? "active" : "inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        —
                      </td>
                      <td className="py-4 px-4 text-foreground font-medium">
                        —
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.subscriptions &&
                            member.subscriptions.length > 0 && (
                              <>
                                {member.subscriptions[0].status === "FROZEN" ? (
                                  <button
                                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    title="Unfreeze Membership"
                                    onClick={async () => {
                                      try {
                                        const updated =
                                          await membershipsService.unfreezeMembership(
                                            member.subscriptions![0].id,
                                          );
                                        const normalized = {
                                          id: updated.id,
                                          status: updated.status,
                                          startDate: updated.startDate,
                                          endDate: updated.endDate,
                                          membershipPlan: updated.plan,
                                        };
                                        setMembers((prev) =>
                                          prev.map((m) =>
                                            m.id === member.id
                                              ? {
                                                  ...m,
                                                  subscriptions: [normalized],
                                                }
                                              : m,
                                          ),
                                        );
                                      } catch (err: any) {
                                        toast.error(
                                          err?.response?.data?.message ||
                                            "Failed to unfreeze membership",
                                        );
                                      }
                                    }}
                                  >
                                    <Play className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    title="Freeze Membership"
                                    onClick={async () => {
                                      try {
                                        const updated =
                                          await membershipsService.freezeMembership(
                                            member.subscriptions![0].id,
                                          );
                                        const normalized = {
                                          id: updated.id,
                                          status: updated.status,
                                          startDate: updated.startDate,
                                          endDate: updated.endDate,
                                          membershipPlan: updated.plan,
                                        };
                                        setMembers((prev) =>
                                          prev.map((m) =>
                                            m.id === member.id
                                              ? {
                                                  ...m,
                                                  subscriptions: [normalized],
                                                }
                                              : m,
                                          ),
                                        );
                                      } catch (err: any) {
                                        toast.error(
                                          err?.response?.data?.message ||
                                            "Failed to freeze membership",
                                        );
                                      }
                                    }}
                                  >
                                    <Snowflake className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  className="p-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                  title="Cancel Membership"
                                  onClick={async () => {
                                    try {
                                      const updated =
                                        await membershipsService.cancelMembership(
                                          member.subscriptions![0].id,
                                        );
                                      const normalized = {
                                        id: updated.id,
                                        status: updated.status,
                                        startDate: updated.startDate,
                                        endDate: updated.endDate,
                                        membershipPlan: updated.plan,
                                      };
                                      setMembers((prev) =>
                                        prev.map((m) =>
                                          m.id === member.id
                                            ? {
                                                ...m,
                                                subscriptions: [normalized],
                                              }
                                            : m,
                                        ),
                                      );
                                    } catch (err: any) {
                                      toast.error(
                                        err?.response?.data?.message ||
                                          "Failed to cancel membership",
                                      );
                                    }
                                  }}
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          <button
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="View"
                            onClick={() => openView(member)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Edit"
                            onClick={() => openEdit(member)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Deactivate"
                            onClick={() => openDelete(member)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <DataPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={pagination.setPage}
            onItemsPerPageChange={pagination.setLimit}
          />
        </div>
      </div>

      <FormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Member"
        onSubmit={handleCreate}
        submitText="Create Member"
        isLoading={isSaving}
      >
        <FormInput
          label="First Name"
          name="firstName"
          value={createForm.firstName}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))
          }
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={createForm.lastName}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))
          }
          required
        />
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={createForm.email}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={createForm.password}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, password: e.target.value }))
          }
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={createForm.phone}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="+1 (555) 000-0000"
          required={false}
        />
        <FormInput
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={createForm.dateOfBirth}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))
          }
          required={false}
        />
      </FormModal>

      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Member"
        onSubmit={handleUpdate}
        submitText="Save Changes"
        isLoading={isSaving}
      >
        <FormInput
          label="First Name"
          name="firstName"
          value={editForm.firstName || ""}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
          }
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={editForm.lastName || ""}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
          }
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={editForm.phone || ""}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="+1 (555) 000-0000"
          required={false}
        />
        <FormInput
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={editForm.dateOfBirth || ""}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))
          }
          required={false}
        />
      </FormModal>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        title="Deactivate Member"
        description="This will deactivate the member account. You can re-activate later from the backend."
        confirmText="Deactivate"
        type="danger"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Member Details"
        size="lg"
      >
        {selectedMember ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-foreground font-medium">
                {selectedMember.firstName} {selectedMember.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-foreground font-medium">
                {selectedMember.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-foreground font-medium">
                {selectedMember.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-foreground font-medium">
                {selectedMember.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Membership</p>
              {selectedMember.subscriptions &&
              selectedMember.subscriptions.length > 0 ? (
                <div className="mt-2 rounded-lg border border-border bg-background p-3">
                  <p className="text-foreground font-medium">
                    {selectedMember.subscriptions[0].membershipPlan?.name ||
                      "Unknown Plan"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: {selectedMember.subscriptions[0].status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ends:{" "}
                    {new Date(
                      selectedMember.subscriptions[0].endDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No active plan</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No member selected.</p>
        )}
      </Modal>
    </AdminLayout>
  );
}
