/**
 * Workout Custom Hooks
 * TanStack Query hooks for workout plan data management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutApi } from "../api/workouts.js";
import { useNotificationStore } from "../stores/useNotificationStore.js";

/**
 * Hook to fetch paginated list of workout plans
 * @param {Object} params - Query parameters (page, limit, search, trainerId, memberId, etc.)
 * @returns {Object} Query result with workout plans data, loading state, and error
 */
export function useWorkouts(params = {}) {
  return useQuery({
    queryKey: ["workouts", params],
    queryFn: () => workoutApi.getAll(params),
  });
}

/**
 * Hook to fetch a single workout plan by ID
 * @param {string} id - Workout plan UUID
 * @returns {Object} Query result with workout plan data, loading state, and error
 */
export function useWorkout(id) {
  return useQuery({
    queryKey: ["workouts", id],
    queryFn: () => workoutApi.getById(id),
    enabled: !!id, // Only run query if id is provided
  });
}

/**
 * Hook to create a new workout plan
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: workoutApi.create,
    onSuccess: () => {
      // Invalidate workouts list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["workouts"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Workout plan created successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to create workout plan. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to update an existing workout plan
 * @returns {Object} Mutation object with mutate function and status
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ id, data }) => workoutApi.update(id, data),
    // Optimistic update - immediately update cache before server responds
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["workouts", id] });

      // Snapshot the previous value
      const previousWorkout = queryClient.getQueryData(["workouts", id]);

      // Optimistically update the cache
      if (previousWorkout) {
        queryClient.setQueryData(["workouts", id], {
          ...previousWorkout,
          ...data,
        });
      }

      // Return context with previous value for rollback
      return { previousWorkout, id };
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific workout plan query
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workouts", variables.id] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Workout plan updated successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workouts", context.id],
          context.previousWorkout,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to update workout plan. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workouts", variables.id] });
    },
  });
}

/**
 * Hook to delete a workout plan
 * @returns {Object} Mutation object with mutate function and status
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: workoutApi.delete,
    onSuccess: () => {
      // Invalidate workouts list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["workouts"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Workout plan deleted successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to delete workout plan. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to assign a workout plan to a member
 * @returns {Object} Mutation object with mutate function and status
 */
export function useAssignWorkout() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ workoutId, data }) =>
      workoutApi.assignToMember(workoutId, data),
    onSuccess: (_, variables) => {
      // Invalidate workout queries to reflect updated assignment
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({
        queryKey: ["workouts", variables.workoutId],
      });
      // Also invalidate member queries to reflect assigned workout
      if (variables.data?.memberId) {
        queryClient.invalidateQueries({ queryKey: ["members"] });
        queryClient.invalidateQueries({
          queryKey: ["members", variables.data.memberId],
        });
        queryClient.invalidateQueries({
          queryKey: ["members", variables.data.memberId, "workout-plans"],
        });
      }

      // Show success notification
      addNotification({
        type: "success",
        message: "Workout plan assigned successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage ||
          "Failed to assign workout plan. Please try again.",
        duration: 5000,
      });
    },
  });
}
