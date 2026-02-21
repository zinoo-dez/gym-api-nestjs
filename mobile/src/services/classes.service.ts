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

export const classesService = {
  async getClasses(params?: GetClassesParams): Promise<ClassesPage> {
    const response = await apiClient.get<
      ClassesPage | ApiResponseEnvelope<ClassesPage>
    >("/classes", {
      params,
    });

    return unwrapApiData(response.data);
  },

  async bookClass(classScheduleId: string, memberId: string): Promise<ClassBooking> {
    const response = await apiClient.post<
      ClassBooking | ApiResponseEnvelope<ClassBooking>
    >(`/classes/schedules/${classScheduleId}/book`, {
      memberId,
    });

    return unwrapApiData(response.data);
  },
};
