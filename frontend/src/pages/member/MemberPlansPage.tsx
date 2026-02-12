import { useEffect, useState } from "react";
import { MemberLayout } from "@/layouts";
import { PrimaryButton, SecondaryButton } from "@/components/gym";
import { Badge } from "@/components/ui/badge";
import {
  membershipsService,
  type MembershipPlan,
  type Membership,
} from "@/services/memberships.service";
import { membersService } from "@/services/members.service";
import { toast } from "sonner";
import { Check, Download, Loader2 } from "lucide-react";

export default function MemberPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(
    null,
  );
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountPreview, setDiscountPreview] = useState<
    Record<
      string,
      { originalPrice: number; finalPrice: number; discountAmount: number }
    >
  >({});

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const loadPreviews = async () => {
      if (!discountCode.trim() || plans.length === 0) {
        setDiscountPreview({});
        setDiscountError(null);
        return;
      }

      try {
        const previews = await Promise.all(
          plans.map((plan) =>
            membershipsService
              .previewDiscount(plan.id, discountCode.trim())
              .then((result: any) => ({ planId: plan.id, result })),
          ),
        );
        const nextPreview: Record<
          string,
          { originalPrice: number; finalPrice: number; discountAmount: number }
        > = {};
        previews.forEach((preview) => {
          nextPreview[preview.planId] = {
            originalPrice: preview.result.originalPrice,
            finalPrice: preview.result.finalPrice,
            discountAmount: preview.result.discountAmount,
          };
        });
        setDiscountPreview(nextPreview);
        setDiscountError(null);
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Invalid discount code.";
        setDiscountPreview({});
        setDiscountError(message);
      }
    };

    const timer = setTimeout(loadPreviews, 400);
    return () => clearTimeout(timer);
  }, [discountCode, plans]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const [response, member] = await Promise.all([
        membershipsService.getAllPlans({ limit: 50 }),
        membersService.getMe(),
      ]);
      setPlans(Array.isArray(response.data) ? response.data : []);
      const activeSubscription = member.subscriptions?.find(
        (sub: any) => sub.status === "ACTIVE",
      );
      setCurrentSubscription(activeSubscription || null);
    } catch (err) {
      console.error("Error loading plans:", err);
      toast.error("Failed to load membership plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribingPlanId(planId);
    try {
      const membership = await membershipsService.subscribe({
        planId,
        discountCode: discountCode.trim() || undefined,
      });
      toast.success("Successfully subscribed to membership plan!");
      setCurrentSubscription(membership);
      setDiscountCode("");
    } catch (err: any) {
      console.error("Error subscribing:", err);
      const message =
        err.response?.data?.message || "Failed to subscribe to membership plan";
      toast.error(message);
      setSubscribingPlanId(null);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!currentSubscription) return;
    setDownloadingInvoice(true);
    try {
      const blob = await membershipsService.downloadInvoice(
        currentSubscription.id,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${currentSubscription.id.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download invoice:", err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Membership Plans
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose the perfect plan for your fitness journey
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <label
            htmlFor="discountCode"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Discount Code
          </label>
          <input
            id="discountCode"
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter code (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {discountError ? (
            <p className="mt-2 text-sm text-red-500">{discountError}</p>
          ) : null}
        </div>

        {currentSubscription && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-primary">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="font-medium">
                Current Plan:{" "}
                {currentSubscription.plan?.name || "Active Membership"}
              </div>
              <div className="text-sm">
                Expires{" "}
                {new Date(currentSubscription.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-2 text-sm text-primary">
              {(currentSubscription.discountAmount || 0) > 0 ? (
                <>
                  Discount applied: -$
                  {Number(currentSubscription.discountAmount).toFixed(2)} · Total: $
                  {Number(
                    currentSubscription.finalPrice ??
                      currentSubscription.plan?.price ??
                      0,
                  ).toFixed(2)}
                </>
              ) : (
                <>Total: ${Number(
                  currentSubscription.finalPrice ??
                    currentSubscription.plan?.price ??
                    0,
                ).toFixed(2)}</>
              )}
            </div>
            <div className="mt-3">
              <SecondaryButton
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
              >
                {downloadingInvoice ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </>
                )}
              </SecondaryButton>
            </div>
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No membership plans available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card border border-border rounded-lg p-6 flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {plan.durationDays} days
                    </Badge>
                  </div>

                  {plan.description && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {plan.description}
                    </p>
                  )}

                <div className="mb-6">
                  {discountPreview[plan.id] ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                          ${discountPreview[plan.id].finalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${discountPreview[plan.id].originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-primary">
                        You save ${discountPreview[plan.id].discountAmount.toFixed(2)}
                      </div>
                      <span className="text-muted-foreground ml-1 text-sm">
                        / {plan.durationDays} days
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        / {plan.durationDays} days
                      </span>
                    </div>
                  )}
                </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentSubscription?.planId === plan.id && (
                  <div className="mb-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <PrimaryButton
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={
                    subscribingPlanId === plan.id ||
                    Boolean(currentSubscription)
                  }
                  className="w-full"
                >
                  {subscribingPlanId === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Subscribing...
                    </>
                  ) : currentSubscription?.planId === plan.id ? (
                    "Subscribed"
                  ) : currentSubscription ? (
                    "Subscription Active"
                  ) : (
                    "Subscribe Now"
                  )}
                </PrimaryButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
