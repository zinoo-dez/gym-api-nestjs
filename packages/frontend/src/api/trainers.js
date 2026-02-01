/**
 * Trainer API Service
 * Handles all trainer-related API calls
 */

import apiClient from "./client.js";

/**
 * Trainer API endpoints
 */
export const trainerApi = {
  /**
   * Get all trainers with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, search, specialization, etc.)
   * @returns {Promise<Object>} Paginated trainer list
   */
  getAll: (params) => apiClient.get("/trainers", { params }),

  /**
   * Get a single trainer by ID
   * @param {string} id - Trainer UUID
   * @returns {Promise<Object>} Trainer details
   */
  getById: (id) => apiClient.get(`/trainers/${id}`),

  /**
   * Create a new trainer
   * @param {Object} data - Trainer data
   * @returns {Promise<Object>} Created trainer
   */
  create: (data) => apiClient.post("/trainers", data),

  /**
   * Update an existing trainer
   * @param {string} id - Trainer UUID
   * @param {Object} data - Updated trainer data
   * @returns {Promise<Object>} Updated trainer
   */
  update: (id, data) => apiClient.patch(`/trainers/${id}`, data),

  /**
   * Delete (deactivate) a trainer
   * @param {string} id - Trainer UUID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => apiClient.delete(`/trainers/${id}`),

  /**
   * Get trainer's assigned classes
   * @param {string} id - Trainer UUID
   * @returns {Promise<Array>} List of classes
   */
  getClasses: (id) => apiClient.get(`/trainers/${id}/classes`),
};
