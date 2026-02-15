import { useCallback, useEffect, useMemo, useState } from "react";
import {
  paymentsService,
  type Payment,
  type PaymentStatus,
  type PaymentMethodType,
  type PaymentProvider,
} from "@/services/payments.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, DollarSign, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(
  /\/api\/?$/,
  "",
);

const statusOptions: Array<{ label: string; value: PaymentStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
];

const methodTypeOptions: Array<{ label: string; value: PaymentMethodType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Bank", value: "BANK" },
  { label: "Wallet", value: "WALLET" },
];

const providerOptions: Array<{ label: string; value: PaymentProvider | "all" }> = [
  { label: "All", value: "all" },
  { label: "AYA", value: "AYA" },
  { label: "KBZ", value: "KBZ" },
  { label: "CB", value: "CB" },
  { label: "UAB", value: "UAB" },
  { label: "A Bank", value: "A_BANK" },
  { label: "Yoma", value: "YOMA" },
  { label: "KBZ Pay", value: "KBZ_PAY" },
  { label: "AYA Pay", value: "AYA_PAY" },
  { label: "CB Pay", value: "CB_PAY" },
  { label: "UAB Pay", value: "UAB_PAY" },
  { label: "Wave Money", value: "WAVE_MONEY" },
];

const Payments = () => {
  const [list, setList] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [methodTypeFilter, setMethodTypeFilter] = useState<PaymentMethodType | "all">("all");
  const [providerFilter, setProviderFilter] = useState<PaymentProvider | "all">("all");

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await paymentsService.getAll({
        limit: 200,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        methodType: methodTypeFilter === "all" ? undefined : methodTypeFilter,
        provider: providerFilter === "all" ? undefined : providerFilter,
      });
      setList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load payments", err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, methodTypeFilter, providerFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const totals = useMemo(() => {
    const totalPaid = list
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = list
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalRejected = list.filter((p) => p.status === "REJECTED").length;
    return { totalPaid, totalPending, totalRejected };
  }, [list]);

  const statusColor = (s: Payment["status"]) =>
    s === "PAID" ? "default" : s === "PENDING" ? "secondary" : "destructive";

  const updateStatus = async (id: string, status: PaymentStatus) => {
    try {
      const updated = await paymentsService.updateStatus(id, { status });
      setList((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(`Payment marked ${status.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update payment");
    }
  };

  return (
    <div className="m3-admin-page">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manual payment review</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <M3KpiCard
          title="Total Paid"
          value={`${totals.totalPaid.toLocaleString()} MMK`}
          icon={DollarSign}
          tone="success"
        />
        <M3KpiCard
          title="Pending"
          value={`${totals.totalPending.toLocaleString()} MMK`}
          icon={Clock}
          tone="warning"
        />
        <M3KpiCard
          title="Rejected"
          value={totals.totalRejected}
          icon={AlertCircle}
          tone="danger"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={methodTypeFilter} onValueChange={(value) => setMethodTypeFilter(value as any)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                {methodTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={(value) => setProviderFilter(value as any)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Provider" /></SelectTrigger>
              <SelectContent>
                {providerOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadPayments} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Plan</TableHead>
                <TableHead className="hidden lg:table-cell">Method</TableHead>
                <TableHead className="hidden lg:table-cell">Transaction</TableHead>
                <TableHead className="hidden xl:table-cell">Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.member ? `${p.member.firstName} ${p.member.lastName}` : "Member"}
                      <div className="text-xs text-muted-foreground">{p.member?.email}</div>
                    </TableCell>
                    <TableCell>{p.amount.toLocaleString()} {p.currency}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.subscription?.membershipPlan?.name || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {p.methodType} / {p.provider.replace("_", " ")}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{p.transactionNo}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {p.screenshotUrl ? (
                        (() => {
                          const decoded = p.screenshotUrl
                            .replace(/&#x2F;/g, "/")
                            .replace(/&amp;/g, "&");
                          const proofUrl = decoded.startsWith("http")
                            ? decoded
                            : `${API_BASE}${decoded.startsWith("/") ? "" : "/"}${decoded}`;
                          return (
                        <a
                          className="text-primary hover:underline"
                          href={proofUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                          );
                        })()
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => updateStatus(p.id, "PAID")}>Mark Paid</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "REJECTED")}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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

export default Payments;
