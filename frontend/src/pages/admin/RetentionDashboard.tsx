import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Users, UserX, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type RetentionMember,
  type RetentionOverview,
  type RetentionRiskLevel,
} from "@/services/retention.service";
import { toast } from "sonner";

const RetentionDashboard = () => {
  const [overview, setOverview] = useState<RetentionOverview | null>(null);
  const [members, setMembers] = useState<RetentionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

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

  const stats = useMemo(
    () => [
      {
        title: "High Risk",
        value: overview?.highRisk ?? 0,
        icon: AlertTriangle,
      },
      {
        title: "Medium Risk",
        value: overview?.mediumRisk ?? 0,
        icon: UserX,
      },
      {
        title: "Open Tasks",
        value: overview?.openTasks ?? 0,
        icon: Users,
      },
      {
        title: "Evaluated Members",
        value: overview?.evaluatedMembers ?? 0,
        icon: Users,
      },
    ],
    [overview],
  );

  const riskBadge = (level: RetentionRiskLevel) => {
    if (level === "HIGH") return <Badge variant="destructive">HIGH</Badge>;
    if (level === "MEDIUM") return <Badge variant="secondary">MEDIUM</Badge>;
    return <Badge variant="outline">LOW</Badge>;
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Retention Dashboard</h1>
          <p className="text-muted-foreground">Monitor churn risk and follow-up workload</p>
        </div>
        <Button onClick={handleRecalculate} disabled={isRecalculating}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          {isRecalculating ? "Recalculating..." : "Recalculate"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Members</CardTitle>
          <div className="flex flex-col lg:flex-row gap-3">
            <Input
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Min score"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-[140px]"
            />
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Days Since Check-in</TableHead>
                <TableHead>Pending Payments</TableHead>
                <TableHead className="hidden lg:table-cell">Reasons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No retention members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.memberId}>
                    <TableCell>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </TableCell>
                    <TableCell>{riskBadge(member.riskLevel)}</TableCell>
                    <TableCell>{member.score}</TableCell>
                    <TableCell>{member.daysSinceCheckIn ?? "-"}</TableCell>
                    <TableCell>{member.unpaidPendingCount}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {member.reasons.join(", ") || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetentionDashboard;

