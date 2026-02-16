import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  paymentsService,
  type RecoveryQueueResponse,
  type RecoveryQueueItem,
} from "@/services/payments.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Clock, CreditCard, AlertTriangle, Send, RefreshCcw, Calendar, History, MessageSquareShare } from "lucide-react";
import { Label } from "@/components/ui/label";

const Recovery = () => {
  const [days, setDays] = useState(7);
  const [queue, setQueue] = useState<RecoveryQueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await paymentsService.getRecoveryQueue(days);
      setQueue(data);
    } catch (error) {
      console.error("Failed to load recovery queue", error);
      toast.error("Failed to load recovery queue");
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const sendFollowUp = async (item: RecoveryQueueItem, retry = false) => {
    try {
      await paymentsService.sendRecoveryFollowUp(item.paymentId, {
        message: noteMap[item.paymentId] || undefined,
        markAsRetryRequested: retry,
      });
      toast.success(retry ? "Retry request sent" : "Follow-up sent");
      await loadQueue();
    } catch (error) {
      console.error("Failed to send follow-up", error);
      toast.error("Failed to send follow-up");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Recovery Queue</h1>
            <p className="text-sm text-muted-foreground">
              Manage expiring memberships and resolve failed transaction attempts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl border border-border">
              <span className="m3-label !text-[9px] pl-2">Lookahead</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 7)}
                className="w-16 h-8 rounded-lg border-none bg-background font-mono font-semibold text-xs focus-visible:ring-primary"
              />
              <span className="m3-label !text-[9px] pr-2">Days</span>
            </div>
            <Button 
              variant="outline" 
              onClick={loadQueue} 
              disabled={isLoading}
              className="h-10 rounded-xl border-border font-bold font-mono text-xs hover:bg-muted"
            >
              <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Sync Queue
            </Button>
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <M3KpiCard 
          title="Expiring Within Window" 
          value={queue?.totalExpiringSoon ?? 0} 
          tone="warning" 
          icon={Clock}
        />
        <M3KpiCard 
          title="Pending Recovery" 
          value={queue?.totalPendingPayments ?? 0} 
          tone="primary" 
          icon={CreditCard}
        />
        <M3KpiCard 
          title="Critical Rejections" 
          value={queue?.totalRejectedPayments ?? 0} 
          tone="danger" 
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Expiring Memberships */}
        <section className="xl:col-span-12 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-orange-50">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="m3-title-md">Renewal Forecasting</h2>
              <p className="text-xs text-muted-foreground">Memberships reaching base term end within the selected {days}-day window.</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/30 text-left border-y border-border">
                <tr>
                  <th className="px-5 py-4 m3-label !text-[10px]">Cardholder Identity</th>
                  <th className="px-2 py-4 m3-label !text-[10px]">Assigned Tier</th>
                  <th className="px-2 py-4 m3-label !text-[10px]">Contract End Date</th>
                  <th className="px-5 py-4 m3-label !text-[10px] text-right">Maturity Countdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <RefreshCcw className="h-8 w-8 text-blue-100 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : (queue?.expiringSoon ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-muted-foreground italic">No forecast data available for this window.</td>
                  </tr>
                ) : (
                  queue?.expiringSoon.map((item) => (
                    <tr key={item.subscriptionId} className="group hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{item.memberName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.memberEmail}</div>
                      </td>
                      <td className="px-2 py-4">
                        <Badge variant="outline" className="rounded-lg bg-blue-50/50 border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                          {item.planName}
                        </Badge>
                      </td>
                      <td className="px-2 py-4 font-medium text-foreground">
                        {new Date(item.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Badge className={cn(
                          "rounded-lg border-none px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                          item.daysToExpiry <= 3 ? "bg-red-50 text-red-700 shadow-sm shadow-red-100 animate-pulse" : "bg-orange-50 text-orange-700"
                        )}>
                          {item.daysToExpiry} Day{item.daysToExpiry !== 1 && "s"} Left
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Failed Payment Recovery */}
        <section className="xl:col-span-12 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-red-50">
              <History className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="m3-title-md">Transaction Recovery Actions</h2>
              <p className="text-xs text-muted-foreground">Immediate manual intervention for failed or disputed membership dues.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[...(queue?.pendingPayments ?? []), ...(queue?.rejectedPayments ?? [])].map(
              (item) => (
                <div key={item.paymentId} className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 p-5 hover:bg-card hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        item.status === "REJECTED" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      )}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-none mb-1.5">{item.memberName}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{item.memberEmail}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-lg border-none px-2 py-0.5 text-[10px] font-bold",
                      item.status === "REJECTED" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                    )}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount Due</span>
                      <span className="text-lg font-bold font-mono text-foreground">{item.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{item.currency}</span></span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Follow-up Communication</Label>
                      <div className="relative">
                        <MessageSquareShare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
                        <Textarea
                          placeholder="Draft specialized recovery message or internal narrative..."
                          value={noteMap[item.paymentId] ?? ""}
                          onChange={(e) =>
                            setNoteMap((prev) => ({ ...prev, [item.paymentId]: e.target.value }))
                          }
                          className="min-h-[100px] pl-10 rounded-xl border-border bg-card text-xs py-3 focus-visible:ring-blue-600 placeholder:text-muted-foreground/70"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                      onClick={() => sendFollowUp(item, false)}
                    >
                      <Send className="h-4 w-4" />
                      Dispatch Follow-up
                    </Button>
                    {item.status === "REJECTED" && (
                      <Button 
                        variant="outline" 
                        className="h-10 rounded-xl border-border text-foreground font-bold hover:bg-muted flex items-center gap-2"
                        onClick={() => sendFollowUp(item, true)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Retry Request
                      </Button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
          
          {(!queue || (queue.pendingPayments.length === 0 && queue.rejectedPayments.length === 0)) && (
            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-border">
              <History className="h-12 w-12 mb-3 mx-auto text-muted-foreground/70" />
              <p className="font-medium text-muted-foreground">Zero recovery items pending intervention.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Recovery;
