/**
 * Workout API Service
 * Handles all workout plan-related API calls
 */

import apiClient from "./client.js";

/**
 * Workout API endpoints
 */
export const workoutApi = {
  /**
   * Get all workout plans with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, search, trainerId, memberId, etc.)
   * @returns {Promise<Object>} Paginated workout plan list
   */
  getAll: (params) => apiClient.get("/workout-plans", { params }),

  /**
   * Get a single workout plan by ID
   * @param {string} id - Workout plan UUID
   * @returns {Promise<Object>} Workout plan details
   */
  getById: (id) => apiClient.get(`/workout-plans/${id}`),

  /**
   * Create a new workout plan
   * @param {Object} data - Workout plan data
   * @returns {Promise<Object>} Created workout plan
   */
  create: (data) => apiClient.post("/workout-plans", data),

  /**
   * Update an existing workout plan
   * @param {string} id - Workout plan UUID
   * @param {Object} data - Updated workout plan data
   * @returns {Promise<Object>} Updated workout plan
   */
  update: (id, data) => apiClient.patch(`/workout-plans/${id}`, data),

  /**
   * Delete a workout plan
   * @param {string} id - Workout plan UUID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => apiClient.delete(`/workout-plans/${id}`),

  /**
   * Get workout plans for a specific member
   * @param {string} memberId - Member UUID
   * @returns {Promise<Array>} List of workout plans
   */
  getByMember: (memberId) => apiClient.get(`/workout-plans/member/${memberId}`),
};
