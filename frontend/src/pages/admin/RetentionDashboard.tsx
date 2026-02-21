import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Users, UserX, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  retentionService,
  type RetentionMemberDetail,
  type RetentionMember,
  type RetentionOverview,
  type RetentionRiskLevel,
} from "@/services/retention.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Search, Filter, ShieldAlert, ShieldQuestion, ShieldCheck, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RetentionDashboard = () => {
  const [overview, setOverview] = useState<RetentionOverview | null>(null);
  const [members, setMembers] = useState<RetentionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<RetentionMemberDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<RetentionRiskLevel | "all">("all");
  const [minScore, setMinScore] = useState<string>("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, membersRes] = await Promise.all([
        retentionService.getOverview(),
        retentionService.getMembers({
          limit: 50,
          search: search || undefined,
          riskLevel: riskLevel === "all" ? undefined : riskLevel,
          minScore: minScore ? Number(minScore) : undefined,
        }),
      ]);
      setOverview(overviewRes);
      setMembers(Array.isArray(membersRes?.data) ? membersRes.data : []);
    } catch (error) {
      console.error("Failed to load retention dashboard", error);
      toast.error("Failed to load retention dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [search, riskLevel, minScore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const result = await retentionService.recalculate();
      toast.success(
        `Recalculated ${result.processed} members (H:${result.high} M:${result.medium} L:${result.low})`,
      );
      await loadData();
    } catch (error) {
      console.error("Retention recalculation failed", error);
      toast.error("Failed to recalculate retention");
    } finally {
      setIsRecalculating(false);
    }
  };

  const openMemberDetail = async (memberId: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const detail = await retentionService.getMemberDetail(memberId);
      setSelectedMember(detail);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load member detail");
      setSelectedMember(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const stats = useMemo(
    () => [
      {
        title: "High Risk Members",
        value: overview?.highRisk ?? 0,
        icon: ShieldAlert,
        tone: "danger" as const,
      },
      {
        title: "Dormant / Medium",
        value: overview?.mediumRisk ?? 0,
        icon: ShieldQuestion,
        tone: "warning" as const,
      },
      {
        title: "Active Follow-ups",
        value: overview?.openTasks ?? 0,
        icon: UserCheck,
        tone: "primary" as const,
      },
      {
        title: "Healthy Retention",
        value: (overview?.evaluatedMembers ?? 0) - (overview?.highRisk ?? 0) - (overview?.mediumRisk ?? 0),
        icon: ShieldCheck,
        tone: "success" as const,
      },
    ],
    [overview],
  );

  const riskBadge = (level: RetentionRiskLevel) => {
    if (level === "HIGH") {
      return (
        <Badge className="rounded-lg bg-red-100 text-red-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase">
          Critical Risk
        </Badge>
      );
    }
    if (level === "MEDIUM") {
      return (
        <Badge className="rounded-lg bg-orange-100 text-orange-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase">
          At Risk
        </Badge>
      );
    }
    return (
      <Badge className="rounded-lg bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase">
        Stable
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Retention Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Anticipate churn by monitoring inactivity, payment delays, and membership usage.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRecalculate} 
            disabled={isRecalculating}
            className="h-10 rounded-xl border-border font-semibold text-xs transition-all"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", isRecalculating && "animate-spin")} />
            {isRecalculating ? "Syncing Risks..." : "Sync Risk Profiles"}
          </Button>
        </div>
      </section>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <M3KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>

      {/* Main Content: Risk List */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="m3-title-md">Member Risk Profile</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="m3-label !normal-case !tracking-normal bg-muted/50 border-border">
                {members.length} Profile{members.length !== 1 && "s"} Tracked
              </Badge>
              {overview?.highRisk && overview.highRisk > 0 && (
                <Badge className="m3-label !normal-case !tracking-normal bg-red-50 border-red-100 text-red-600">
                  {overview.highRisk} High Risk Actions
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 w-full sm:w-64 rounded-xl border-border focus-visible:ring-blue-600"
              />
            </div>
            <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as any)}>
              <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl border-border focus:ring-primary m3-label !text-[11px]">
                <SelectValue placeholder="All Risks" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="rounded-lg">All Risks</SelectItem>
                <SelectItem value="HIGH" className="rounded-lg">Critical Risk</SelectItem>
                <SelectItem value="MEDIUM" className="rounded-lg">At Risk</SelectItem>
                <SelectItem value="LOW" className="rounded-lg">Stable</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Score"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="pl-8 h-10 w-full sm:w-28 rounded-xl border-border text-xs font-mono focus-visible:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/30 text-left border-y border-border">
              <tr>
                <th className="px-5 py-4 m3-label !text-[10px]">Identity & Contact</th>
                <th className="px-2 py-4 m3-label !text-[10px]">Threat Level</th>
                <th className="px-2 py-4 m3-label !text-[10px] text-center">Score</th>
                <th className="px-2 py-4 m3-label !text-[10px] text-center">Inactivity</th>
                <th className="px-2 py-4 m3-label !text-[10px] text-center">Arrears</th>
                <th className="px-5 py-4 m3-label !text-[10px] text-right hidden lg:table-cell">Heuristic Reasons</th>
                <th className="px-5 py-4 m3-label !text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <RefreshCcw className="h-8 w-8 text-blue-200 animate-spin mb-4" />
                      <p className="text-muted-foreground text-xs font-medium italic">Analyzing member behavior...</p>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-muted-foreground">
                    <p className="font-medium italic">No member risk profiles match these filters.</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.memberId} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">{member.fullName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{member.email}</div>
                    </td>
                    <td className="px-2 py-4">
                      {riskBadge(member.riskLevel)}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-9 h-9 rounded-xl border text-xs font-bold font-mono",
                        member.score > 70 ? "bg-red-50 border-red-100 text-red-700" :
                        member.score > 40 ? "bg-orange-50 border-orange-100 text-orange-700" :
                        "bg-emerald-50 border-emerald-100 text-emerald-700"
                      )}>
                        {member.score}
                      </div>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span className="text-xs font-medium text-foreground">
                        {member.daysSinceCheckIn ?? "-"} <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">days</span>
                      </span>
                    </td>
                    <td className="px-2 py-4 text-center">
                      {member.unpaidPendingCount > 0 ? (
                        <div className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold font-mono">
                          {member.unpaidPendingCount}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/70">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right hidden lg:table-cell">
                      <div className="flex flex-wrap justify-end gap-1">
                        {member.reasons.length > 0 ? (
                          member.reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="h-5 rounded-md text-[9px] font-medium border-border bg-muted text-muted-foreground max-w-[120px] truncate">
                              {reason}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground/70 italic text-[10px]">No anomalies</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => openMemberDetail(member.memberId)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Retention Member Detail</DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <p className="text-sm text-muted-foreground">Loading member detail...</p>
          ) : !selectedMember ? (
            <p className="text-sm text-muted-foreground">No member detail available.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="font-semibold">{selectedMember.risk.fullName}</p>
                <p className="text-xs text-muted-foreground">{selectedMember.risk.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {riskBadge(selectedMember.risk.riskLevel)}
                  <Badge variant="outline">Score: {selectedMember.risk.score}</Badge>
                  <Badge variant="outline">
                    Pending Payments: {selectedMember.risk.unpaidPendingCount}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedMember.risk.reasons.map((reason, idx) => (
                    <Badge key={`${reason}-${idx}`} variant="outline">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="mb-2 font-semibold">Recent Retention Tasks</p>
                {selectedMember.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks found.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMember.tasks.map((task) => (
                      <div key={task.id} className="rounded border p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge variant="outline">
                            {task.status} | P{task.priority}
                          </Badge>
                        </div>
                        {task.note && (
                          <p className="mt-1 text-xs text-muted-foreground">{task.note}</p>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"} | Assigned:{" "}
                          {task.assignedToEmail || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-3">
                <p className="mb-2 font-semibold">Recent Subscriptions</p>
                {selectedMember.recentSubscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent subscriptions.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMember.recentSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="rounded border p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{subscription.planName || "Unknown Plan"}</p>
                          <Badge variant="outline">{subscription.status}</Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(subscription.startDate).toLocaleDateString()} -{" "}
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RetentionDashboard;
