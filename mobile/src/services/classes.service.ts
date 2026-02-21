import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";
import type { ClassBooking, ClassesPage } from "@/types/classes";

export interface GetClassesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  trainerId?: string;
  classType?: string;
}

interface MemberProfileResponse {
  id: string;
}

async function getCurrentMemberId(): Promise<string> {
  const response = await apiClient.get<
    MemberProfileResponse | ApiResponseEnvelope<MemberProfileResponse>
  >("/members/me");
  const profile = unwrapApiData(response.data);

  if (!profile?.id) {
    throw new Error("Member profile not found");
  }

  return profile.id;
}

export const classesService = {
  async getClasses(params?: GetClassesParams): Promise<ClassesPage> {
    const response = await apiClient.get<
      ClassesPage | ApiResponseEnvelope<ClassesPage>
    >("/classes", {
      params,
    });

    return unwrapApiData(response.data);
  },

  async bookClass(classScheduleId: string): Promise<ClassBooking> {
    const memberId = await getCurrentMemberId();
    const response = await apiClient.post<
      ClassBooking | ApiResponseEnvelope<ClassBooking>
    >(`/classes/schedules/${classScheduleId}/book`, {
      memberId,
    });

    return unwrapApiData(response.data);
  },
};
