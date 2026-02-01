/**
 * useErrorHandler Hook
 * Provides error handling utilities for API errors
 */

import { useCallback } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";

export function useErrorHandler() {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  /**
   * Handle API errors and display appropriate notifications
   * @param {Object} error - Enhanced error object from API client
   * @param {Object} options - Options for error handling
   * @param {Function} options.onValidationError - Callback for validation errors
   * @param {Function} options.onRetry - Callback for retry action
   * @param {boolean} options.showNotification - Whether to show notification (default: true)
   */
  const handleError = useCallback(
    (error, options = {}) => {
      const { onValidationError, onRetry, showNotification = true } = options;

      // Handle validation errors (400)
      if (error.isValidationError) {
        if (onValidationError && error.validationErrors) {
          onValidationError(error.validationErrors);
        }
        if (showNotification) {
          addNotification({
            type: "error",
            message: error.userMessage,
            duration: 5000,
          });
        }
        return;
      }

      // Handle network errors
      if (error.isNetworkError) {
        if (showNotification) {
          addNotification({
            type: "error",
            message: error.userMessage,
            duration: 7000,
            action: onRetry
              ? {
                  label: "Retry",
                  onClick: onRetry,
                }
              : undefined,
          });
        }
        return;
      }

      // Handle server errors (5xx)
      if (error.isServerError) {
        if (showNotification) {
          addNotification({
            type: "error",
            message: error.userMessage,
            duration: 6000,
          });
        }
        return;
      }

      // Handle auth errors (401) - already handled by interceptor
      if (error.isAuthError) {
        // Auth errors redirect to login, no notification needed
        return;
      }

      // Handle other errors
      if (showNotification) {
        addNotification({
          type: "error",
          message: error.userMessage || "An unexpected error occurred",
          duration: 5000,
        });
      }
    },
    [addNotification],
  );

  /**
   * Show a success notification
   * @param {string} message - Success message
   * @param {number} duration - Duration in ms (default: 3000)
   */
  const showSuccess = useCallback(
    (message, duration = 3000) => {
      addNotification({
        type: "success",
        message,
        duration,
      });
    },
    [addNotification],
  );

  /**
   * Show an error notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in ms (default: 5000)
   */
  const showError = useCallback(
    (message, duration = 5000) => {
      addNotification({
        type: "error",
        message,
        duration,
      });
    },
    [addNotification],
  );

  /**
   * Show a warning notification
   * @param {string} message - Warning message
   * @param {number} duration - Duration in ms (default: 4000)
   */
  const showWarning = useCallback(
    (message, duration = 4000) => {
      addNotification({
        type: "warning",
        message,
        duration,
      });
    },
    [addNotification],
  );

  /**
   * Show an info notification
   * @param {string} message - Info message
   * @param {number} duration - Duration in ms (default: 3000)
   */
  const showInfo = useCallback(
    (message, duration = 3000) => {
      addNotification({
        type: "info",
        message,
        duration,
      });
    },
    [addNotification],
  );

  return {
    handleError,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
