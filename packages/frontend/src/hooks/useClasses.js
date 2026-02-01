/**
 * Class Custom Hooks
 * TanStack Query hooks for class data management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classApi } from "../api/classes.js";
import { useNotificationStore } from "../stores/useNotificationStore.js";

// Class schedules and bookings change frequently, so use shorter cache times
const classQueryOptions = {
  staleTime: 2 * 60 * 1000, // 2 minutes - classes and bookings change frequently
  gcTime: 10 * 60 * 1000, // 10 minutes
};

/**
 * Hook to fetch paginated list of classes
 * @param {Object} params - Query parameters (page, limit, date, trainerId, status, etc.)
 * @returns {Object} Query result with classes data, loading state, and error
 */
export function useClasses(params = {}) {
  return useQuery({
    queryKey: ["classes", params],
    queryFn: () => classApi.getAll(params),
    ...classQueryOptions,
  });
}

/**
 * Hook to fetch a single class by ID
 * @param {string} id - Class UUID
 * @returns {Object} Query result with class data, loading state, and error
 */
export function useClass(id) {
  return useQuery({
    queryKey: ["classes", id],
    queryFn: () => classApi.getById(id),
    enabled: !!id, // Only run query if id is provided
    ...classQueryOptions,
  });
}

/**
 * Hook to create a new class
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCreateClass() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: classApi.create,
    onSuccess: () => {
      // Invalidate classes list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["classes"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Class created successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to create class. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to update an existing class
 * @returns {Object} Mutation object with mutate function and status
 */
export function useUpdateClass() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ id, data }) => classApi.update(id, data),
    // Optimistic update - immediately update cache before server responds
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["classes", id] });

      // Snapshot the previous value
      const previousClass = queryClient.getQueryData(["classes", id]);

      // Optimistically update the cache
      if (previousClass) {
        queryClient.setQueryData(["classes", id], {
          ...previousClass,
          ...data,
        });
      }

      // Return context with previous value for rollback
      return { previousClass, id };
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific class query
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["classes", variables.id] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Class updated successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousClass) {
        queryClient.setQueryData(
          ["classes", context.id],
          context.previousClass,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to update class. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes", variables.id] });
    },
  });
}

/**
 * Hook to delete (cancel) a class
 * @returns {Object} Mutation object with mutate function and status
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: classApi.delete,
    onSuccess: () => {
      // Invalidate classes list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["classes"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Class cancelled successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to cancel class. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to book a class for a member
 * @returns {Object} Mutation object with mutate function and status
 */
export function useBookClass() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ classId, data }) => classApi.bookClass(classId, data),
    // Optimistic update - immediately update enrollment count
    onMutate: async ({ classId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["classes", classId] });

      // Snapshot the previous value
      const previousClass = queryClient.getQueryData(["classes", classId]);

      // Optimistically update the cache
      if (previousClass) {
        queryClient.setQueryData(["classes", classId], {
          ...previousClass,
          enrolled: (previousClass.enrolled || 0) + 1,
        });
      }

      // Return context for rollback
      return { previousClass, classId };
    },
    onSuccess: (_, variables) => {
      // Invalidate classes list and specific class to update enrollment count
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId],
      });
      // Also invalidate bookings for this class
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "bookings"],
      });

      // Show success notification
      addNotification({
        type: "success",
        message: "Class booked successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousClass) {
        queryClient.setQueryData(
          ["classes", context.classId],
          context.previousClass,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message: error.userMessage || "Failed to book class. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId],
      });
    },
  });
}

/**
 * Hook to cancel a class booking
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: ({ classId, bookingId }) =>
      classApi.cancelBooking(classId, bookingId),
    // Optimistic update - immediately update enrollment count
    onMutate: async ({ classId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["classes", classId] });

      // Snapshot the previous value
      const previousClass = queryClient.getQueryData(["classes", classId]);

      // Optimistically update the cache
      if (previousClass) {
        queryClient.setQueryData(["classes", classId], {
          ...previousClass,
          enrolled: Math.max((previousClass.enrolled || 0) - 1, 0),
        });
      }

      // Return context for rollback
      return { previousClass, classId };
    },
    onSuccess: (_, variables) => {
      // Invalidate classes list and specific class to update enrollment count
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId],
      });
      // Also invalidate bookings for this class
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "bookings"],
      });

      // Show success notification
      addNotification({
        type: "success",
        message: "Booking cancelled successfully!",
        duration: 3000,
      });
    },
    onError: (error, _, context) => {
      // Rollback optimistic update on error
      if (context?.previousClass) {
        queryClient.setQueryData(
          ["classes", context.classId],
          context.previousClass,
        );
      }

      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to cancel booking. Please try again.",
        duration: 5000,
      });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId],
      });
    },
  });
}

/**
 * Hook to fetch bookings for a specific class
 * @param {string} classId - Class UUID
 * @returns {Object} Query result with bookings data, loading state, and error
 */
export function useClassBookings(classId) {
  return useQuery({
    queryKey: ["classes", classId, "bookings"],
    queryFn: () => classApi.getBookings(classId),
    enabled: !!classId,
    ...classQueryOptions,
  });
}
