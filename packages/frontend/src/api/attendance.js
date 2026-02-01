/**
 * Attendance API Service
 * Handles all attendance-related API calls
 */

import apiClient from "./client.js";

/**
 * Attendance API endpoints
 */
export const attendanceApi = {
  /**
   * Get all attendance records with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, memberId, startDate, endDate, type, etc.)
   * @returns {Promise<Object>} Paginated attendance records list
   */
  getAll: (params) => apiClient.get("/attendance", { params }),

  /**
   * Get a single attendance record by ID
   * @param {string} id - Attendance record UUID
   * @returns {Promise<Object>} Attendance record details
   */
  getById: (id) => apiClient.get(`/attendance/${id}`),

  /**
   * Record new attendance (check-in)
   * @param {Object} data - Attendance data (memberId, classId, type)
   * @returns {Promise<Object>} Created attendance record
   */
  record: (data) => apiClient.post("/attendance/check-in", data),

  /**
   * Check out (update an attendance record)
   * @param {string} id - Attendance record UUID
   * @returns {Promise<Object>} Updated attendance record
   */
  checkOut: (id) => apiClient.post(`/attendance/${id}/check-out`),

  /**
   * Get attendance report/statistics for a member
   * @param {string} memberId - Member UUID
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise<Object>} Attendance report with statistics
   */
  getReport: (memberId, params) =>
    apiClient.get(`/attendance/report/${memberId}`, { params }),

  /**
   * Get attendance statistics (aggregated across all members or filtered)
   * @param {Object} params - Query parameters (memberId, startDate, endDate, etc.)
   * @returns {Promise<Object>} Attendance statistics (total visits, trends, etc.)
   */
  getStatistics: (params) => {
    // If memberId is provided, use the report endpoint
    if (params.memberId) {
      return apiClient
        .get(`/attendance/report/${params.memberId}`, {
          params: {
            startDate: params.startDate,
            endDate: params.endDate,
          },
        })
        .then((response) => {
          // Map the backend response to frontend format
          return {
            totalVisits: response.totalVisits || 0,
            gymVisits: response.totalGymVisits || 0,
            classAttendances: response.totalClassAttendances || 0,
            averageVisitsPerWeek: response.averageVisitsPerWeek || 0,
            peakVisitHours: response.peakVisitHours || [],
            visitsByDayOfWeek: response.visitsByDayOfWeek || [],
          };
        });
    }
    // Otherwise, we'll need to aggregate from the list endpoint
    return apiClient.get("/attendance", { params }).then((response) => {
      // Calculate statistics from the response data
      const records = response.data || [];
      const totalVisits = records.length;
      const gymVisits = records.filter((r) => r.type === "GYM_VISIT").length;
      const classAttendances = records.filter(
        (r) => r.type === "CLASS_ATTENDANCE",
      ).length;

      return {
        totalVisits,
        gymVisits,
        classAttendances,
      };
    });
  },
};
