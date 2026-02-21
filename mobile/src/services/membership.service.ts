import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";
import type { Membership } from "@/types/membership";

export const membershipService = {
  async getCurrentMembership(): Promise<Membership | null> {
    try {
      const response = await apiClient.get<
        Membership | ApiResponseEnvelope<Membership>
      >("/memberships/me");

      return unwrapApiData(response.data);
    } catch {
      return null;
    }
  },
};
