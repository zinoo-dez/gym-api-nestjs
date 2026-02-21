import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";
import type { ProgressEntry } from "@/types/progress";

export const progressService = {
  async getMyProgress(): Promise<ProgressEntry[]> {
    const response = await apiClient.get<
      ProgressEntry[] | ApiResponseEnvelope<ProgressEntry[]>
    >("/trainer-sessions/me/progress");

    return unwrapApiData(response.data);
  },
};
