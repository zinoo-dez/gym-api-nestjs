import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ClassScheduleFilters,
  MemberSearchOption,
  RescheduleClassInput,
  SaveClassInput,
  UpdateRosterStatusInput,
} from "@/features/classes";
import { classSchedulingService } from "@/services/class-scheduling.service";
import { peopleService } from "@/services/people.service";

export const classSchedulingKeys = {
  all: ["class-scheduling"] as const,
  classes: {
    all: ["class-scheduling", "classes"] as const,
    list: (filters: ClassScheduleFilters) => ["class-scheduling", "classes", "list", filters] as const,
  },
  roster: {
    all: ["class-scheduling", "roster"] as const,
    detail: (classId: string) => ["class-scheduling", "roster", classId] as const,
  },
  members: {
    search: (query: string) => ["class-scheduling", "members", "search", query] as const,
  },
  instructors: () => ["class-scheduling", "instructors"] as const,
};

export const useClassSchedulesQuery = (filters: ClassScheduleFilters) =>
  useQuery({
    queryKey: classSchedulingKeys.classes.list(filters),
    queryFn: () => classSchedulingService.listClasses(filters),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

export const useClassRosterQuery = (classId: string, enabled = true) =>
  useQuery({
    queryKey: classSchedulingKeys.roster.detail(classId),
    queryFn: () => classSchedulingService.getClassRoster(classId),
    staleTime: 10_000,
    refetchInterval: enabled ? 10_000 : false,
    enabled: enabled && classId.length > 0,
  });

export const useClassInstructorsQuery = () =>
  useQuery({
    queryKey: classSchedulingKeys.instructors(),
    queryFn: async () => {
      const instructors = await peopleService.listTrainers();
      return instructors
        .filter((trainer) => trainer.isActive)
        .sort((left, right) => {
          const leftName = `${left.firstName} ${left.lastName}`.trim().toLowerCase();
          const rightName = `${right.firstName} ${right.lastName}`.trim().toLowerCase();

          return leftName.localeCompare(rightName);
        });
    },
    staleTime: 120_000,
  });

export const useMemberSearchQuery = (query: string, enabled = true) =>
  useQuery({
    queryKey: classSchedulingKeys.members.search(query),
    queryFn: (): Promise<MemberSearchOption[]> => classSchedulingService.searchMembers(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 20_000,
  });

export const useCreateClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveClassInput) => classSchedulingService.createClass(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classSchedulingKeys.classes.all });
    },
  });
};

export const useUpdateClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, payload }: { classId: string; payload: Partial<SaveClassInput> }) =>
      classSchedulingService.updateClass(classId, payload),
    onSuccess: (_updatedClass, variables) => {
      void queryClient.invalidateQueries({ queryKey: classSchedulingKeys.classes.all });
      void queryClient.invalidateQueries({
        queryKey: classSchedulingKeys.roster.detail(variables.classId),
      });
    },
  });
};

export const useRescheduleClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RescheduleClassInput) => classSchedulingService.rescheduleClass(payload),
    onSuccess: (_updatedClass, variables) => {
      void queryClient.invalidateQueries({ queryKey: classSchedulingKeys.classes.all });
      void queryClient.invalidateQueries({
        queryKey: classSchedulingKeys.roster.detail(variables.classId),
      });
    },
  });
};

export const useDeleteClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => classSchedulingService.deleteClass(classId),
    onSuccess: (_response, classId) => {
      void queryClient.invalidateQueries({ queryKey: classSchedulingKeys.classes.all });
      void queryClient.invalidateQueries({
        queryKey: classSchedulingKeys.roster.detail(classId),
      });
    },
  });
};

export const useUpdateAttendanceStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRosterStatusInput) => classSchedulingService.updateAttendanceStatus(payload),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: classSchedulingKeys.roster.detail(variables.classId),
      });
      void queryClient.invalidateQueries({ queryKey: classSchedulingKeys.classes.all });
    },
  });
};

export const useAddMemberToClassMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, memberId }: { classId: string; memberId: string }) =>
      classSchedulingService.addMemberToClass(classId, memberId),
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: classSchedulingKeys.roster.detail(variables.classId),
      });
      void queryClient.invalidateQueries({ queryKey: classSchedulingKeys.classes.all });
    },
  });
};
