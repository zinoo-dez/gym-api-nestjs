import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  BusinessHoursFormValues,
  GeneralSettingsFormValues,
  MembershipPlanInput,
  PaymentsSettingsFormValues,
  SecuritySettingsFormValues,
} from "@/features/settings";
import { settingsService } from "@/services/settings.service";

export const settingsQueryKeys = {
  all: ["settings"] as const,
  detail: () => ["settings", "detail"] as const,
};

export const useSystemSettingsQuery = () => {
  return useQuery({
    queryKey: settingsQueryKeys.detail(),
    queryFn: () => settingsService.getSettings(),
    staleTime: 10_000,
  });
};

export const useUpdateGeneralSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: GeneralSettingsFormValues) => settingsService.updateGeneralSettings(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};

export const useUpdateBusinessHoursMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BusinessHoursFormValues) => settingsService.updateBusinessHours(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};

export const useUpdatePaymentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PaymentsSettingsFormValues) => settingsService.updatePayments(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};

export const useUpdateSecurityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SecuritySettingsFormValues) => settingsService.updateSecurity(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};

export const useCreateMembershipPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MembershipPlanInput) => settingsService.createMembershipPlan(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};

export const useUpdateMembershipPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MembershipPlanInput }) =>
      settingsService.updateMembershipPlan(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};

export const useDeleteMembershipPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => settingsService.deleteMembershipPlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
};
