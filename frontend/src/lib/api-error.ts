/**
 * Shared API error utilities.
 * Import from here instead of duplicating error-handling logic across hooks/services.
 */

/**
 * Extracts a human-readable message from an unknown API/network error.
 * Handles Axios response envelopes, plain Error objects, and unknown values.
 *
 * @param error   - The caught error value.
 * @param fallback - Message to return when no details are available.
 */
export const getApiErrorMessage = (
    error: unknown,
    fallback = "An unexpected error occurred. Please try again.",
): string => {
    if (typeof error !== "object" || error === null) {
        return fallback;
    }

    const err = error as {
        message?: string;
        response?: {
            data?: {
                message?: string | string[];
            };
        };
    };

    const apiMessage = err.response?.data?.message;

    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
        return apiMessage.join(", ");
    }

    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
        return apiMessage.trim();
    }

    if (typeof err.message === "string" && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return fallback;
};
