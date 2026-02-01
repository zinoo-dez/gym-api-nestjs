/**
 * Attendance Custom Hooks
 * TanStack Query hooks for attendance data management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance.js";
import { useNotificationStore } from "../stores/useNotificationStore.js";

// Attendance data changes frequently, so use shorter cache times
const attendanceQueryOptions = {
  staleTime: 1 * 60 * 1000, // 1 minute - attendance changes frequently
  gcTime: 5 * 60 * 1000, // 5 minutes
};

/**
 * Hook to fetch paginated list of attendance records with filtering support
 * @param {Object} params - Query parameters (page, limit, memberId, startDate, endDate, type, etc.)
 * @returns {Object} Query result with attendance data, loading state, and error
 */
export function useAttendance(params = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => attendanceApi.getAll(params),
    ...attendanceQueryOptions,
  });
}

/**
 * Hook to fetch a single attendance record by ID
 * @param {string} id - Attendance record UUID
 * @returns {Object} Query result with attendance record data, loading state, and error
 */
export function useAttendanceRecord(id) {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id, // Only run query if id is provided
    ...attendanceQueryOptions,
  });
}

/**
 * Hook to record new attendance (check-in)
 * @returns {Object} Mutation object with mutate function and status
 */
export function useRecordAttendance() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: attendanceApi.record,
    onSuccess: () => {
      // Invalidate attendance list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      // Also invalidate statistics as new attendance affects stats
      queryClient.invalidateQueries({ queryKey: ["attendance", "statistics"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Attendance recorded successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to record attendance. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to check out (update an attendance record)
 * @returns {Object} Mutation object with mutate function and status
 */
export function useCheckOut() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  return useMutation({
    mutationFn: attendanceApi.checkOut,
    onSuccess: (_, id) => {
      // Invalidate both the list and the specific attendance record query
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", id] });
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: ["attendance", "statistics"] });

      // Show success notification
      addNotification({
        type: "success",
        message: "Check-out recorded successfully!",
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error notification
      addNotification({
        type: "error",
        message:
          error.userMessage || "Failed to record check-out. Please try again.",
        duration: 5000,
      });
    },
  });
}

/**
 * Hook to fetch attendance statistics
 * @param {Object} params - Query parameters (memberId, startDate, endDate, etc.)
 * @returns {Object} Query result with statistics data, loading state, and error
 */
export function useAttendanceStatistics(params = {}) {
  return useQuery({
    queryKey: ["attendance", "statistics", params],
    queryFn: () => attendanceApi.getStatistics(params),
    ...attendanceQueryOptions,
  });
}
