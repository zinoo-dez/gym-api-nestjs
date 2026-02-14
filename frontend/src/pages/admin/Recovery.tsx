import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-6 px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recovery Queue</h1>
          <p className="text-muted-foreground">
            Renewal reminders and failed-payment recovery actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 7)}
            className="w-24"
          />
          <Button variant="outline" onClick={loadQueue} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold mt-1">{queue?.totalExpiringSoon ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-2xl font-bold mt-1">{queue?.totalPendingPayments ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Rejected Payments</p>
            <p className="text-2xl font-bold mt-1">{queue?.totalRejectedPayments ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(queue?.expiringSoon ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No expiring memberships in this window.
                  </TableCell>
                </TableRow>
              ) : (
                queue?.expiringSoon.map((item) => (
                  <TableRow key={item.subscriptionId}>
                    <TableCell>
                      <div className="font-medium">{item.memberName}</div>
                      <div className="text-xs text-muted-foreground">{item.memberEmail}</div>
                    </TableCell>
                    <TableCell>{item.planName}</TableCell>
                    <TableCell>{new Date(item.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={item.daysToExpiry <= 3 ? "destructive" : "secondary"}>
                        {item.daysToExpiry} day(s)
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending/Rejected Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...(queue?.pendingPayments ?? []), ...(queue?.rejectedPayments ?? [])].map(
            (item) => (
              <div key={item.paymentId} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.memberName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.memberEmail} • {item.amount.toLocaleString()} {item.currency}
                    </p>
                  </div>
                  <Badge variant={item.status === "REJECTED" ? "destructive" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
                <Textarea
                  placeholder="Optional follow-up message..."
                  value={noteMap[item.paymentId] ?? ""}
                  onChange={(e) =>
                    setNoteMap((prev) => ({ ...prev, [item.paymentId]: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => sendFollowUp(item, false)}>
                    Send Follow-up
                  </Button>
                  {item.status === "REJECTED" && (
                    <Button size="sm" variant="outline" onClick={() => sendFollowUp(item, true)}>
                      Request Retry
                    </Button>
                  )}
                </div>
              </div>
            ),
          )}
          {(!queue || (queue.pendingPayments.length === 0 && queue.rejectedPayments.length === 0)) && (
            <p className="text-sm text-muted-foreground">No payment recovery items.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Recovery;

