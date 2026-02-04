
import * as React from "react"
import { AdminLayout } from "../../layouts"
import { PrimaryButton, SecondaryButton } from "@/components/gym"
import { cn } from "@/lib/utils"
import { membersService, type Member } from "@/services/members.service"
import { membershipsService, type MembershipPlan } from "@/services/memberships.service"

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<Member[]>([])
  const [plans, setPlans] = React.useState<MembershipPlan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [planFilter, setPlanFilter] = React.useState("all")

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members Management</h1>
            <p className="text-muted-foreground">Manage all gym members and their memberships.</p>
          </div>
          <PrimaryButton>
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
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
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
    </AdminLayout>
  )
}
