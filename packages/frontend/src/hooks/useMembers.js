/**
 * Member Custom Hooks
 * TanStack Query hooks for member data management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberApi } from "../api/members.js";
import { useNotificationStore } from "../stores/useNotificationStore.js";

/**
 * Hook to fetch paginated list of members
 * @param {Object} params - Query parameters (page, limit, search, status, etc.)
 * @returns {Object} Query result with members data, loading state, and error
 */
export function useMembers(params = {}) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => memberApi.getAll(params),
  });
}

/**
 * Hook to fetch a single member by ID
 * @param {string} id - Member UUID
 * @returns {Object} Query result with member data, loading state, and error
 */
export function useMember(id) {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => memberApi.getById(id),
    enabled: !!id, // Only run query if id is provided
  });
}

/**
 * Hook to create a new member
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCreateMember() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: memberApi.create,
    onSuccess: () => {
      // Invalidate members list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["members"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Member created successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to create member. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to update an existing member
 * @returns {Object} Mutation object with mutate function and status
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ id, data }) => memberApi.update(id, data),
    // Optimistic update - immediately update cache before server responds
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["members", id] });

      // Snapshot the previous value
      const previousMember = queryClient.getQueryData(["members", id]);

      // Optimistically update the cache
      if (previousMember) {
        queryClient.setQueryData(["members", id], {
          ...previousMember,
          ...data,
        });
      }

      // Return context with previous value for rollback
      return { previousMember, id };
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific member query
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Member updated successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousMember) {
        queryClient.setQueryData(
          ["members", context.id],
          context.previousMember,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to update member. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
    },
  });
}

/**
 * Hook to delete (deactivate) a member
 * @returns {Object} Mutation object with mutate function and status
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: memberApi.delete,
    // Optimistic update - immediately remove from list
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["members"] });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueriesData({
        queryKey: ["members"],
      });

      // Optimistically update all member list queries
      queryClient.setQueriesData({ queryKey: ["members"] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((member) => member.id !== id),
        };
      });

      // Return context for rollback
      return { previousMembers };
    },
    onSuccess: () => {
      // Invalidate members list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["members"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Member deactivated successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousMembers) {
        context.previousMembers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to deactivate member. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to fetch member's class bookings
 * @param {string} memberId - Member UUID
 * @returns {Object} Query result with bookings data, loading state, and error
 */
export function useMemberBookings(memberId) {
  return useQuery({
    queryKey: ["members", memberId, "bookings"],
    queryFn: () => memberApi.getBookings(memberId),
    enabled: !!memberId,
  });
}

/**
 * Hook to fetch member's workout plans
 * @param {string} memberId - Member UUID
 * @returns {Object} Query result with workout plans data, loading state, and error
 */
export function useMemberWorkoutPlans(memberId) {
  return useQuery({
    queryKey: ["members", memberId, "workout-plans"],
    queryFn: () => memberApi.getWorkoutPlans(memberId),
    enabled: !!memberId,
  });
}
