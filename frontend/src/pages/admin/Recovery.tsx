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
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Recovery Queue</p>
            <p className="text-sm text-gray-500">
              Manage expiring memberships and resolve failed transaction attempts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Lookahead</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 7)}
                className="w-16 h-8 rounded-lg border-none bg-white font-mono font-bold text-xs focus-visible:ring-blue-600"
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-2">Days</span>
            </div>
            <Button 
              variant="outline" 
              onClick={loadQueue} 
              disabled={isLoading}
              className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
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
        <section className="xl:col-span-12 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-orange-50">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Renewal Forecasting</h2>
              <p className="text-xs text-gray-500">Memberships reaching base term end within the selected {days}-day window.</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold border-y border-gray-100">
                <tr>
                  <th className="px-5 py-4">Cardholder Identity</th>
                  <th className="px-2 py-4">Assigned Tier</th>
                  <th className="px-2 py-4">Contract End Date</th>
                  <th className="px-5 py-4 text-right">Maturity Countdown</th>
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
                    <td colSpan={4} className="py-20 text-center text-gray-400 italic">No forecast data available for this window.</td>
                  </tr>
                ) : (
                  queue?.expiringSoon.map((item) => (
                    <tr key={item.subscriptionId} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{item.memberName}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">{item.memberEmail}</div>
                      </td>
                      <td className="px-2 py-4">
                        <Badge variant="outline" className="rounded-lg bg-blue-50/50 border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                          {item.planName}
                        </Badge>
                      </td>
                      <td className="px-2 py-4 font-medium text-gray-600">
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
        <section className="xl:col-span-12 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-red-50">
              <History className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Transaction Recovery Actions</h2>
              <p className="text-xs text-gray-500">Immediate manual intervention for failed or disputed membership dues.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[...(queue?.pendingPayments ?? []), ...(queue?.rejectedPayments ?? [])].map(
              (item) => (
                <div key={item.paymentId} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/30 p-5 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        item.status === "REJECTED" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      )}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1.5">{item.memberName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{item.memberEmail}</p>
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
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Due</span>
                      <span className="text-lg font-bold font-mono text-gray-900">{item.amount.toLocaleString()} <span className="text-xs font-normal text-gray-400">{item.currency}</span></span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Follow-up Communication</Label>
                      <div className="relative">
                        <MessageSquareShare className="absolute left-3 top-3 h-4 w-4 text-gray-300 pointer-events-none" />
                        <Textarea
                          placeholder="Draft specialized recovery message or internal narrative..."
                          value={noteMap[item.paymentId] ?? ""}
                          onChange={(e) =>
                            setNoteMap((prev) => ({ ...prev, [item.paymentId]: e.target.value }))
                          }
                          className="min-h-[100px] pl-10 rounded-xl border-gray-100 bg-white text-xs py-3 focus-visible:ring-blue-600 placeholder:text-gray-300"
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
                        className="h-10 rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center gap-2"
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
            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100">
              <History className="h-12 w-12 mb-3 mx-auto text-gray-100" />
              <p className="font-medium text-gray-400">Zero recovery items pending intervention.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Recovery;
