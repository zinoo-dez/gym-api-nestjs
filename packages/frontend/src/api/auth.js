/**
 * Authentication API Service
 * Handles authentication-related API calls
 */

import apiClient from "./client.js";

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Login with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<{accessToken: string, user: Object}>} Authentication token and user data
   */
  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  /**
   * Register a new user account
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.role - User role (ADMIN, TRAINER, MEMBER)
   * @returns {Promise<{accessToken: string, user: Object}>} Authentication token and user data
   */
  register: async (userData) => {
    return apiClient.post("/auth/register", userData);
  },
};
