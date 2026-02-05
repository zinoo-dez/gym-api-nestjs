
import * as React from "react"
import { AdminLayout } from "../../layouts"
import { PrimaryButton, SecondaryButton, FormInput } from "@/components/gym"
import { cn } from "@/lib/utils"
import { membersService, type Member, type CreateMemberRequest, type UpdateMemberRequest } from "@/services/members.service"
import { membershipsService, type MembershipPlan } from "@/services/memberships.service"
import { FormModal } from "@/components/gym/form-modal"
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog"
import { toast } from "sonner"

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<Member[]>([])
  const [plans, setPlans] = React.useState<MembershipPlan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [planFilter, setPlanFilter] = React.useState("all")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [createForm, setCreateForm] = React.useState<CreateMemberRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  })
  const [editForm, setEditForm] = React.useState<UpdateMemberRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [membersResponse, plansResponse] = await Promise.all([
          membersService.getAll({ limit: 50 }),
          membershipsService.getAllPlans({ limit: 50 }),
        ])
        setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : [])
        setPlans(Array.isArray(plansResponse.data) ? plansResponse.data : [])
      } catch (err) {
        console.error("Error loading members:", err)
        setError("Failed to load members.")
        setMembers([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const selectedPlan = plans.find((plan) => plan.id === planFilter)

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      fullName.includes(query) || member.email.toLowerCase().includes(query)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? member.isActive : !member.isActive)
    return matchesSearch && matchesStatus
  })

  const openCreate = () => {
    setCreateForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
    })
    setIsCreateOpen(true)
  }

  const openEdit = (member: Member) => {
    setSelectedMember(member)
    setEditForm({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || "",
      dateOfBirth: member.dateOfBirth
        ? new Date(member.dateOfBirth).toISOString().split("T")[0]
        : "",
    })
    setIsEditOpen(true)
  }

  const openDelete = (member: Member) => {
    setSelectedMember(member)
    setIsDeleteOpen(true)
  }

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      const payload: CreateMemberRequest = {
        ...createForm,
        phone: createForm.phone?.trim() || undefined,
        dateOfBirth: createForm.dateOfBirth || undefined,
      }
      const created = await membersService.create(payload)
      setMembers((prev) => [created, ...prev])
      setIsCreateOpen(false)
      toast.success("Member created successfully")
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create member."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedMember) return
    setIsSaving(true)
    try {
      const payload: UpdateMemberRequest = {
        ...editForm,
        phone: editForm.phone?.trim() || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
      }
      const updated = await membersService.update(selectedMember.id, payload)
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      setIsEditOpen(false)
      setSelectedMember(null)
      toast.success("Member updated successfully")
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update member."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMember) return
    setIsDeleting(true)
    try {
      await membersService.deactivate(selectedMember.id)
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, isActive: false } : m,
        ),
      )
      toast.success("Member deactivated")
      setIsDeleteOpen(false)
      setSelectedMember(null)
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to deactivate member."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members Management</h1>
            <p className="text-muted-foreground">Manage all gym members and their memberships.</p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>

            <SecondaryButton variant="ghost">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Member</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Contact</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Plan</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Joined</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Last Visit</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Visits</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading members...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No members found.
                    </td>
                  </tr>
                ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-foreground text-sm">{member.email}</p>
                        <p className="text-muted-foreground text-sm">
                          {member.phone || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        planFilter !== "all" && selectedPlan?.name === "Elite" && "bg-primary/10 text-primary",
                        planFilter !== "all" && selectedPlan?.name === "Pro" && "bg-blue-500/10 text-blue-400",
                        planFilter !== "all" && selectedPlan?.name === "Basic" && "bg-secondary text-muted-foreground",
                        planFilter === "all" && "bg-secondary text-muted-foreground"
                      )}>
                        {planFilter !== "all" ? selectedPlan?.name ?? "—" : "—"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        member.isActive && "bg-green-500/10 text-green-400",
                        !member.isActive && "bg-yellow-500/10 text-yellow-400"
                      )}>
                        {member.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">—</td>
                    <td className="py-4 px-4 text-foreground font-medium">—</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                          onClick={() => openEdit(member)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          title="Deactivate"
                          onClick={() => openDelete(member)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <p className="text-muted-foreground text-sm">
              Showing {filteredMembers.length} of {members.length} members
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">1</button>
              <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground">2</button>
              <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground">3</button>
              <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
                Next
              </button>
            </div>
          </div>
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
          onChange={(e) => setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))}
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={createForm.lastName}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))}
          required
        />
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={createForm.email}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={createForm.password}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={createForm.phone}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+1 (555) 000-0000"
          required={false}
        />
        <FormInput
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={createForm.dateOfBirth}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
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
          onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={editForm.lastName || ""}
          onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={editForm.phone || ""}
          onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+1 (555) 000-0000"
          required={false}
        />
        <FormInput
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={editForm.dateOfBirth || ""}
          onChange={(e) => setEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
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
    </AdminLayout>
  )
}
