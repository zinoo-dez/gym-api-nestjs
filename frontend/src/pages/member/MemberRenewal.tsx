import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { membershipsService, type Membership } from "@/services/memberships.service";
import { toast } from "sonner";

const MemberRenewal = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!subscriptionId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await membershipsService.getMembershipById(subscriptionId);
        setMembership(data);
      } catch (error: any) {
        console.error("Failed to load membership", error);
        toast.error(error?.response?.data?.message || "Failed to load membership");
        setMembership(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [subscriptionId]);

  const daysToExpiry = useMemo(() => {
    if (!membership?.endDate) return null;
    return Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / 86400000);
  }, [membership?.endDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading renewal details...
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Renew Membership</h1>
        <p className="text-muted-foreground">Subscription not found or inaccessible.</p>
        <Button onClick={() => navigate("/member")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Renew Membership</h1>
        <p className="text-muted-foreground">
          Review your current subscription and continue renewal in your member dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={membership.status === "ACTIVE" ? "secondary" : "destructive"}>
              {membership.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Start Date</span>
            <span>{new Date(membership.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">End Date</span>
            <span>{new Date(membership.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Days Remaining</span>
            <span>{daysToExpiry ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Price</span>
            <span>{membership.finalPrice.toLocaleString()} MMK</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => navigate("/member")}>Open Renewal Options</Button>
        <Button variant="outline" onClick={() => navigate("/member")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default MemberRenewal;

