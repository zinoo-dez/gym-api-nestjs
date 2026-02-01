/**
 * Trainer Custom Hooks
 * TanStack Query hooks for trainer data management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainerApi } from "../api/trainers.js";
import { useNotificationStore } from "../stores/useNotificationStore.js";

/**
 * Hook to fetch paginated list of trainers
 * @param {Object} params - Query parameters (page, limit, search, specialization, etc.)
 * @returns {Object} Query result with trainers data, loading state, and error
 */
export function useTrainers(params = {}) {
  return useQuery({
    queryKey: ["trainers", params],
    queryFn: () => trainerApi.getAll(params),
  });
}

/**
 * Hook to fetch a single trainer by ID
 * @param {string} id - Trainer UUID
 * @returns {Object} Query result with trainer data, loading state, and error
 */
export function useTrainer(id) {
  return useQuery({
    queryKey: ["trainers", id],
    queryFn: () => trainerApi.getById(id),
    enabled: !!id, // Only run query if id is provided
  });
}

/**
 * Hook to create a new trainer
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCreateTrainer() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: trainerApi.create,
    onSuccess: () => {
      // Invalidate trainers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["trainers"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Trainer created successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to create trainer. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to update an existing trainer
 * @returns {Object} Mutation object with mutate function and status
 */
export function useUpdateTrainer() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ id, data }) => trainerApi.update(id, data),
    // Optimistic update - immediately update cache before server responds
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["trainers", id] });

      // Snapshot the previous value
      const previousTrainer = queryClient.getQueryData(["trainers", id]);

      // Optimistically update the cache
      if (previousTrainer) {
        queryClient.setQueryData(["trainers", id], {
          ...previousTrainer,
          ...data,
        });
      }

      // Return context with previous value for rollback
      return { previousTrainer, id };
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific trainer query
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      queryClient.invalidateQueries({ queryKey: ["trainers", variables.id] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Trainer updated successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousTrainer) {
        queryClient.setQueryData(
          ["trainers", context.id],
          context.previousTrainer,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to update trainer. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainers", variables.id] });
    },
  });
}

/**
 * Hook to delete (deactivate) a trainer
 * @returns {Object} Mutation object with mutate function and status
 */
export function useDeleteTrainer() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: trainerApi.delete,
    onSuccess: () => {
      // Invalidate trainers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["trainers"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Trainer deactivated successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to deactivate trainer. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to fetch trainer's assigned classes
 * @param {string} trainerId - Trainer UUID
 * @returns {Object} Query result with classes data, loading state, and error
 */
export function useTrainerClasses(trainerId) {
  return useQuery({
    queryKey: ["trainers", trainerId, "classes"],
    queryFn: () => trainerApi.getClasses(trainerId),
    enabled: !!trainerId,
  });
}
