import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";
import type { Membership, MembershipStatus } from "@/types/membership";

interface MemberSubscriptionSnapshot {
  id: string;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  membershipPlan?: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
}

interface MemberProfileResponse {
  id: string;
  subscriptions?: MemberSubscriptionSnapshot[];
}

function pickCurrentSubscription(
  subscriptions: MemberSubscriptionSnapshot[],
): MemberSubscriptionSnapshot | null {
  if (!subscriptions.length) {
    return null;
  }

  const sorted = [...subscriptions].sort(
    (a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return sorted.find((subscription) => subscription.status === "ACTIVE") ?? sorted[0];
}

export const membershipService = {
  async getCurrentMembership(): Promise<Membership | null> {
    try {
      const response = await apiClient.get<
        MemberProfileResponse | ApiResponseEnvelope<MemberProfileResponse>
      >("/members/me");
      const profile = unwrapApiData(response.data);
      const subscription = pickCurrentSubscription(profile.subscriptions ?? []);

      if (!subscription) {
        return null;
      }

      return {
        id: subscription.id,
        memberId: profile.id,
        planId: subscription.membershipPlan?.id ?? "",
        plan: subscription.membershipPlan
          ? {
              id: subscription.membershipPlan.id,
              name: subscription.membershipPlan.name,
              durationDays: subscription.membershipPlan.durationDays,
              price: subscription.membershipPlan.price,
              features: [],
            }
          : undefined,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
        createdAt: subscription.startDate,
        updatedAt: subscription.endDate,
      };
    } catch {
      return null;
    }
  },
};
