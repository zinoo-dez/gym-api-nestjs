/**
 * Membership API Service
 * Handles all membership plan-related API calls
 */

import apiClient from "./client.js";

/**
 * Membership API endpoints
 */
export const membershipApi = {
  /**
   * Get all membership plans with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise<Object>} Paginated membership plan list
   */
  getAll: (params) => apiClient.get("/membership-plans", { params }),

  /**
   * Get a single membership plan by ID
   * @param {string} id - Membership plan UUID
   * @returns {Promise<Object>} Membership plan details
   */
  getById: (id) => apiClient.get(`/membership-plans/${id}`),

  /**
   * Create a new membership plan
   * @param {Object} data - Membership plan data
   * @returns {Promise<Object>} Created membership plan
   */
  create: (data) => apiClient.post("/membership-plans", data),

  /**
   * Update an existing membership plan
   * @param {string} id - Membership plan UUID
   * @param {Object} data - Updated membership plan data
   * @returns {Promise<Object>} Updated membership plan
   */
  update: (id, data) => apiClient.patch(`/membership-plans/${id}`, data),

  /**
   * Delete a membership plan
   * @param {string} id - Membership plan UUID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => apiClient.delete(`/membership-plans/${id}`),

  /**
   * Assign a membership plan to a member
   * @param {Object} data - Assignment data (memberId, membershipPlanId, startDate, etc.)
   * @returns {Promise<Object>} Assignment confirmation
   */
  assignToMember: (data) => apiClient.post("/memberships", data),
};
