/**
 * Class API Service
 * Handles all class-related API calls
 */

import apiClient from "./client.js";

/**
 * Class API endpoints
 */
export const classApi = {
  /**
   * Get all classes with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, date, trainerId, status, etc.)
   * @returns {Promise<Object>} Paginated class list
   */
  getAll: (params) => apiClient.get("/classes", { params }),

  /**
   * Get a single class by ID
   * @param {string} id - Class UUID
   * @returns {Promise<Object>} Class details
   */
  getById: (id) => apiClient.get(`/classes/${id}`),

  /**
   * Create a new class
   * @param {Object} data - Class data
   * @returns {Promise<Object>} Created class
   */
  create: (data) => apiClient.post("/classes", data),

  /**
   * Update an existing class
   * @param {string} id - Class UUID
   * @param {Object} data - Updated class data
   * @returns {Promise<Object>} Updated class
   */
  update: (id, data) => apiClient.patch(`/classes/${id}`, data),

  /**
   * Delete (cancel) a class
   * @param {string} id - Class UUID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => apiClient.delete(`/classes/${id}`),

  /**
   * Book a class for a member
   * @param {string} classId - Class UUID
   * @param {Object} data - Booking data (memberId)
   * @returns {Promise<Object>} Booking confirmation
   */
  bookClass: (classId, data) =>
    apiClient.post(`/classes/${classId}/book`, data),

  /**
   * Cancel a class booking
   * @param {string} bookingId - Booking UUID
   * @returns {Promise<Object>} Cancellation confirmation
   */
  cancelBooking: (bookingId) =>
    apiClient.delete(`/classes/bookings/${bookingId}`),

  /**
   * Get bookings for a specific class
   * @param {string} classId - Class UUID
   * @returns {Promise<Array>} List of bookings
   */
  getBookings: (classId) => apiClient.get(`/classes/${classId}/bookings`),
};
