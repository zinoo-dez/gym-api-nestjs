/**
 * Application configuration
 * Reads environment variables and provides typed access to configuration values
 */

export const config = {
  /**
   * Backend API base URL
   * @type {string}
   */
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If required environment variables are missing
 */
export function validateConfig() {
  if (!config.apiUrl) {
    throw new Error("VITE_API_URL environment variable is required");
  }
}
