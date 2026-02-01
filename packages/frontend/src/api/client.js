/**
 * API Client
 * Centralized HTTP client with authentication and error handling
 */

import axios from "axios";
import { config } from "../utils/config.js";
import { STORAGE_KEYS } from "../utils/constants.js";

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - attach authentication token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor - handle errors and token expiration
 */
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps responses in {data: {...}, statusCode, timestamp, path}
    // Return just the data property if it exists, otherwise return the whole response.data
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Enhance error object with additional information
    const enhancedError = {
      ...error,
      isNetworkError: false,
      isServerError: false,
      isValidationError: false,
      isAuthError: false,
      userMessage: "An unexpected error occurred",
    };

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      enhancedError.isAuthError = true;
      enhancedError.userMessage =
        "Your session has expired. Please log in again.";

      // Clear authentication data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Redirect to login page
      window.location.href = "/login";
    }
    // Handle 400 Bad Request - validation errors
    else if (error.response?.status === 400) {
      enhancedError.isValidationError = true;
      enhancedError.userMessage =
        error.response.data?.message ||
        "Please check your input and try again.";
      enhancedError.validationErrors = error.response.data?.errors || {};
    }
    // Handle 5xx Server Errors
    else if (error.response?.status >= 500) {
      enhancedError.isServerError = true;
      enhancedError.userMessage =
        "Server error occurred. Please try again later or contact support.";
    }
    // Handle Network Errors (no response from server)
    else if (
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      !error.response
    ) {
      enhancedError.isNetworkError = true;
      enhancedError.userMessage =
        "Network error. Please check your internet connection and try again.";
    }
    // Handle other client errors (403, 404, etc.)
    else if (error.response?.status >= 400 && error.response?.status < 500) {
      enhancedError.userMessage =
        error.response.data?.message ||
        "An error occurred while processing your request.";
    }

    return Promise.reject(enhancedError);
  },
);

export default apiClient;
