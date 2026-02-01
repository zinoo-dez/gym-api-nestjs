/**
 * Member API Service
 * Handles all member-related API calls
 */

import apiClient from "./client.js";

/**
 * Member API endpoints
 */
export const memberApi = {
  /**
   * Get all members with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, search, status, etc.)
   * @returns {Promise<Object>} Paginated member list
   */
  getAll: (params) => apiClient.get("/members", { params }),

  /**
   * Get a single member by ID
   * @param {string} id - Member UUID
   * @returns {Promise<Object>} Member details
   */
  getById: (id) => apiClient.get(`/members/${id}`),

  /**
   * Create a new member
   * @param {Object} data - Member data
   * @returns {Promise<Object>} Created member
   */
  create: (data) => apiClient.post("/members", data),

  /**
   * Update an existing member
   * @param {string} id - Member UUID
   * @param {Object} data - Updated member data
   * @returns {Promise<Object>} Updated member
   */
  update: (id, data) => apiClient.patch(`/members/${id}`, data),

  /**
   * Delete (deactivate) a member
   * @param {string} id - Member UUID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => apiClient.delete(`/members/${id}`),

  /**
   * Get member's class bookings
   * @param {string} id - Member UUID
   * @returns {Promise<Array>} List of bookings
   */
  getBookings: (id) => apiClient.get(`/members/${id}/bookings`),

  /**
   * Get member's workout plans
   * @param {string} id - Member UUID
   * @returns {Promise<Array>} List of workout plans
   */
  getWorkoutPlans: (id) => apiClient.get(`/members/${id}/workout-plans`),
};
