"use client"

import { AdminLayout } from "@/components/layouts"
import { StatCard, PrimaryButton } from "@/components/gym"

const stats = [
  {
    title: "Total Members",
    value: "1,234",
    change: { value: 12, type: "increase" as const },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    title: "Active Memberships",
    value: "1,089",
    change: { value: 8, type: "increase" as const },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    title: "Today's Check-ins",
    value: "342",
    change: { value: 5, type: "decrease" as const },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Monthly Revenue",
    value: "$45,231",
    change: { value: 18, type: "increase" as const },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const recentMembers = [
  { name: "John Smith", email: "john@example.com", plan: "Pro", joined: "2 hours ago", status: "active" },
  { name: "Sarah Johnson", email: "sarah@example.com", plan: "Elite", joined: "5 hours ago", status: "active" },
  { name: "Mike Wilson", email: "mike@example.com", plan: "Basic", joined: "1 day ago", status: "active" },
  { name: "Emily Davis", email: "emily@example.com", plan: "Pro", joined: "2 days ago", status: "active" },
  { name: "Chris Brown", email: "chris@example.com", plan: "Basic", joined: "3 days ago", status: "pending" },
]

const popularClasses = [
  { name: "Morning HIIT", trainer: "Sarah Chen", enrolled: 18, capacity: 20, time: "6:00 AM" },
  { name: "Spin & Burn", trainer: "Sarah Chen", enrolled: 25, capacity: 25, time: "5:30 PM" },
  { name: "Power Yoga", trainer: "Emily Rodriguez", enrolled: 14, capacity: 15, time: "7:30 AM" },
  { name: "CrossFit WOD", trainer: "James Park", enrolled: 12, capacity: 12, time: "12:00 PM" },
  { name: "Pilates", trainer: "Emily Rodriguez", enrolled: 11, capacity: 12, time: "9:00 AM" },
]

const recentActivity = [
  { action: "New member joined", detail: "John Smith signed up for Pro plan", time: "2 hours ago" },
  { action: "Class booking", detail: "15 members booked Morning HIIT", time: "3 hours ago" },
  { action: "Membership renewal", detail: "Sarah Johnson renewed Elite plan", time: "5 hours ago" },
  { action: "Trainer added", detail: "New trainer Marcus Williams added", time: "1 day ago" },
  { action: "Equipment maintenance", detail: "Treadmill #5 scheduled for service", time: "1 day ago" },
]

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
          </div>
          <PrimaryButton>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Member
          </PrimaryButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Members */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Members</h2>
              <a href="/admin/members" className="text-primary text-sm font-medium hover:underline">
                View All
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Member</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.map((member) => (
                    <tr key={member.email} className="border-b border-border/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary text-sm font-semibold">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-foreground font-medium">{member.name}</p>
                            <p className="text-muted-foreground text-sm">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          member.plan === "Elite" 
                            ? "bg-primary/10 text-primary" 
                            : member.plan === "Pro"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {member.plan}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground text-sm">{member.joined}</td>
                      <td className="py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          member.status === "active" 
                            ? "bg-green-500/10 text-green-400" 
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground text-sm font-medium">{activity.action}</p>
                    <p className="text-muted-foreground text-xs">{activity.detail}</p>
                    <p className="text-muted-foreground text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Classes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Popular Classes Today</h2>
            <a href="/admin/classes" className="text-primary text-sm font-medium hover:underline">
              Manage Classes
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {popularClasses.map((cls) => (
              <div
                key={cls.name}
                className="bg-background border border-border rounded-lg p-4"
              >
                <h3 className="font-medium text-foreground mb-1">{cls.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">{cls.trainer}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{cls.time}</span>
                  <span className={`font-medium ${
                    cls.enrolled === cls.capacity ? "text-destructive" : "text-primary"
                  }`}>
                    {cls.enrolled}/{cls.capacity}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cls.enrolled === cls.capacity ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
