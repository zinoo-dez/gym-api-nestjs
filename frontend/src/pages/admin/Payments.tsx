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
import { Search, DollarSign, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const statusVariant = (s: Payment["status"]) =>
    s === "PAID" ? "emerald" : s === "PENDING" ? "amber" : "red";

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
        <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Financial Overview</p>
                        <p className="text-sm text-gray-500">
                            Monitor and manage member transactions and payment verifications.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadPayments} disabled={isLoading} className="h-10 rounded-xl border-gray-200">
                            <RotateCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Received</p>
                        <p className="text-xl font-bold text-gray-900">{totals.totalPaid.toLocaleString()} <span className="text-xs text-gray-400 font-normal">MMK</span></p>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4">
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approval</p>
                        <p className="text-xl font-bold text-gray-900">{totals.totalPending.toLocaleString()} <span className="text-xs text-gray-400 font-normal">MMK</span></p>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4">
                    <div className="rounded-xl bg-red-50 p-3 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected Payments</p>
                        <p className="text-xl font-bold text-gray-900">{totals.totalRejected}</p>
                    </div>
                </div>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-gray-900">Transaction History</p>
                        <p className="text-xs text-gray-500">Manual review and verification logs</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-gray-200"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                            <SelectTrigger className="w-40 h-10 rounded-xl border-gray-200">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={methodTypeFilter} onValueChange={(value) => setMethodTypeFilter(value as any)}>
                            <SelectTrigger className="w-40 h-10 rounded-xl border-gray-200">
                                <SelectValue placeholder="Method" />
                            </SelectTrigger>
                            <SelectContent>
                                {methodTypeOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={providerFilter} onValueChange={(value) => setProviderFilter(value as any)}>
                            <SelectTrigger className="w-48 h-10 rounded-xl border-gray-200">
                                <SelectValue placeholder="Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {providerOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-5">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Member</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium hidden md:table-cell">Plan</th>
                                <th className="px-5 py-3 font-medium hidden lg:table-cell text-center">Provider</th>
                                <th className="px-5 py-3 font-medium hidden lg:table-cell">Transaction ID</th>
                                <th className="px-5 py-3 font-medium hidden xl:table-cell text-center">Proof</th>
                                <th className="px-5 py-3 font-medium text-center">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-gray-500 font-medium">
                                        No transactions found in this period.
                                    </td>
                                </tr>
                            ) : (
                                list.map((p) => {
                                    const variant = statusVariant(p.status);
                                    let statusClass = "bg-gray-100 text-gray-700";
                                    if (variant === "emerald") statusClass = "bg-emerald-100 text-emerald-700";
                                    if (variant === "amber") statusClass = "bg-amber-100 text-amber-700";
                                    if (variant === "red") statusClass = "bg-red-100 text-red-700";

                                    return (
                                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        {p.member ? `${p.member.firstName} ${p.member.lastName}` : "System Payment"}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">{p.member?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{p.amount.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">{p.currency}</span></span>
                                                    <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                                    {p.subscription?.membershipPlan?.name || "One-time Payment"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell text-center text-gray-600">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-medium uppercase tracking-tighter">{p.provider.replace("_", " ")}</span>
                                                    <span className="text-[10px] text-gray-400">{p.methodType}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell">
                                                <code className="bg-gray-50 px-1.5 py-0.5 rounded text-[11px] text-gray-600 border border-gray-100">{p.transactionNo}</code>
                                            </td>
                                            <td className="px-5 py-4 hidden xl:table-cell text-center">
                                                {p.screenshotUrl ? (
                                                    (() => {
                                                        const decoded = p.screenshotUrl.replace(/&#x2F;/g, "/").replace(/&amp;/g, "&");
                                                        const proofUrl = decoded.startsWith("http") ? decoded : `${API_BASE}${decoded.startsWith("/") ? "" : "/"}${decoded}`;
                                                        return (
                                                            <a href={proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-[11px]">
                                                                View Receipt
                                                            </a>
                                                        );
                                                    })()
                                                ) : (
                                                    <span className="text-gray-300 text-[11px]">No Image</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center text-[11px] uppercase tracking-wider font-bold">
                                                <span className={cn("inline-flex rounded-full px-2.5 py-1", statusClass)}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {p.status === "PENDING" ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" onClick={() => updateStatus(p.id, "PAID")} className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white">
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => updateStatus(p.id, "REJECTED")} className="h-8 px-3 rounded-lg text-red-600 hover:bg-red-50 text-xs">
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">Settled</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Payments;
