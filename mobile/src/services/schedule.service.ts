import { classesService } from "@/services/classes.service";
import type { ClassSchedule } from "@/types/classes";

export const scheduleService = {
  async getUpcomingSchedule(limit = 20): Promise<ClassSchedule[]> {
    const classes = await classesService.getClasses({
      page: 1,
      limit,
      startDate: new Date().toISOString(),
    });

    return [...classes.data].sort(
      (a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime(),
    );
  },
};
