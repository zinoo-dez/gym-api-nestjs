"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { PrimaryButton, SecondaryButton } from "@/components/gym"
import { cn } from "@/lib/utils"

const members = [
  { id: 1, name: "John Smith", email: "john@example.com", phone: "(555) 123-4567", plan: "Pro", status: "active", joined: "Jan 15, 2024", lastVisit: "Today", visits: 45 },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "(555) 234-5678", plan: "Elite", status: "active", joined: "Dec 1, 2023", lastVisit: "Yesterday", visits: 78 },
  { id: 3, name: "Mike Wilson", email: "mike@example.com", phone: "(555) 345-6789", plan: "Basic", status: "active", joined: "Feb 20, 2024", lastVisit: "3 days ago", visits: 12 },
  { id: 4, name: "Emily Davis", email: "emily@example.com", phone: "(555) 456-7890", plan: "Pro", status: "active", joined: "Nov 10, 2023", lastVisit: "Today", visits: 92 },
  { id: 5, name: "Chris Brown", email: "chris@example.com", phone: "(555) 567-8901", plan: "Basic", status: "pending", joined: "Mar 1, 2024", lastVisit: "Never", visits: 0 },
  { id: 6, name: "Lisa Anderson", email: "lisa@example.com", phone: "(555) 678-9012", plan: "Elite", status: "active", joined: "Oct 5, 2023", lastVisit: "Today", visits: 120 },
  { id: 7, name: "David Martinez", email: "david@example.com", phone: "(555) 789-0123", plan: "Pro", status: "expired", joined: "Aug 15, 2023", lastVisit: "2 weeks ago", visits: 65 },
  { id: 8, name: "Amanda Taylor", email: "amanda@example.com", phone: "(555) 890-1234", plan: "Basic", status: "active", joined: "Jan 28, 2024", lastVisit: "Yesterday", visits: 23 },
]

export default function AdminMembersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [planFilter, setPlanFilter] = React.useState("all")

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    const matchesPlan = planFilter === "all" || member.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
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
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Elite">Elite</option>
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
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-foreground text-sm">{member.email}</p>
                        <p className="text-muted-foreground text-sm">{member.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        member.plan === "Elite" && "bg-primary/10 text-primary",
                        member.plan === "Pro" && "bg-blue-500/10 text-blue-400",
                        member.plan === "Basic" && "bg-secondary text-muted-foreground"
                      )}>
                        {member.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        member.status === "active" && "bg-green-500/10 text-green-400",
                        member.status === "pending" && "bg-yellow-500/10 text-yellow-400",
                        member.status === "expired" && "bg-red-500/10 text-red-400"
                      )}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{member.joined}</td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{member.lastVisit}</td>
                    <td className="py-4 px-4 text-foreground font-medium">{member.visits}</td>
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
                ))}
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
