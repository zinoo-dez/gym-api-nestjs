/**
 * Membership Custom Hooks
 * TanStack Query hooks for membership plan data management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membershipApi } from "../api/memberships.js";
import { useNotificationStore } from "../stores/useNotificationStore.js";

// Membership plans rarely change, so use longer cache times
const membershipQueryOptions = {
  staleTime: 15 * 60 * 1000, // 15 minutes - membership plans change infrequently
  gcTime: 30 * 60 * 1000, // 30 minutes
};

/**
 * Hook to fetch paginated list of membership plans
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 * @returns {Object} Query result with membership plans data, loading state, and error
 */
export function useMemberships(params = {}) {
  return useQuery({
    queryKey: ["memberships", params],
    queryFn: () => membershipApi.getAll(params),
    ...membershipQueryOptions,
  });
}

/**
 * Hook to fetch a single membership plan by ID
 * @param {string} id - Membership plan UUID
 * @returns {Object} Query result with membership plan data, loading state, and error
 */
export function useMembership(id) {
  return useQuery({
    queryKey: ["memberships", id],
    queryFn: () => membershipApi.getById(id),
    enabled: !!id, // Only run query if id is provided
    ...membershipQueryOptions,
  });
}

/**
 * Hook to create a new membership plan
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCreateMembership() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: membershipApi.create,
    onSuccess: () => {
      // Invalidate memberships list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["memberships"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Membership plan created successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to create membership plan. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to update an existing membership plan
 * @returns {Object} Mutation object with mutate function and status
 */
export function useUpdateMembership() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ id, data }) => membershipApi.update(id, data),
    // Optimistic update - immediately update cache before server responds
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["memberships", id] });

      // Snapshot the previous value
      const previousMembership = queryClient.getQueryData(["memberships", id]);

      // Optimistically update the cache
      if (previousMembership) {
        queryClient.setQueryData(["memberships", id], {
          ...previousMembership,
          ...data,
        });
      }

      // Return context with previous value for rollback
      return { previousMembership, id };
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific membership plan query
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({
        queryKey: ["memberships", variables.id],
      });

      // Show success notification
      addNotification({
        type: "success",
        message: "Membership plan updated successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousMembership) {
        queryClient.setQueryData(
          ["memberships", context.id],
          context.previousMembership,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to update membership plan. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["memberships", variables.id],
      });
    },
  });
}

/**
 * Hook to delete a membership plan
 * @returns {Object} Mutation object with mutate function and status
 */
export function useDeleteMembership() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: membershipApi.delete,
    onSuccess: () => {
      // Invalidate memberships list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["memberships"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Membership plan deleted successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to delete membership plan. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to assign a membership plan to a member
 * @returns {Object} Mutation object with mutate function and status
 */
export function useAssignMembership() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ memberId, data }) =>
      membershipApi.assignToMember(memberId, data),
    onSuccess: (_, variables) => {
      // Invalidate member queries to reflect updated membership
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({
        queryKey: ["members", variables.memberId],
      });
      // Also invalidate memberships list in case it shows assignment counts
      queryClient.invalidateQueries({ queryKey: ["memberships"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Membership plan assigned successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to assign membership plan. Please try again.",
        duration: 5000,
      });
    },
  });
}
