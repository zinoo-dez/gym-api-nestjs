/**
 * Shared runtime type-guard and coercion utilities.
 *
 * Import from here instead of re-declaring these helpers in every service file.
 */

export type GenericRecord = Record<string, unknown>;

/** Narrows `unknown` to a plain object. */
export const isRecord = (value: unknown): value is GenericRecord =>
    typeof value === "object" && value !== null;

/** Returns the value as a record or `null`. */
export const asRecord = (value: unknown): GenericRecord | null =>
    isRecord(value) ? value : null;

/** Returns the value as a non-empty trimmed string, or `undefined`. */
export const asString = (value: unknown): string | undefined => {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

/** Parses the value as a finite number, or returns `undefined`. */
export const asNumber = (value: unknown): number | undefined => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

/** Parses the value as a finite number, returning `fallback` on failure. */
export const toNumber = (value: unknown, fallback = 0): number => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

/** Returns the value as a boolean, parsing `"true"` / `"false"` strings. */
export const asBoolean = (value: unknown): boolean | undefined => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (normalized === "true") {
            return true;
        }

        if (normalized === "false") {
            return false;
        }
    }

    return undefined;
};

/** Returns the value as an array or `null`. */
export const asArray = (value: unknown): unknown[] | null =>
    Array.isArray(value) ? value : null;

/** Safely parses a Date from various input types. */
export const toDate = (value: unknown): Date | null => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Unwraps an API envelope that may be nested up to `maxDepth` levels
 * (e.g. `{ data: { data: payload } }`).
 */
export const unwrapPayload = <T>(value: unknown, maxDepth = 3): T => {
    let cursor: unknown = value;

    for (let depth = 0; depth < maxDepth; depth += 1) {
        if (!isRecord(cursor) || !("data" in cursor)) {
            break;
        }

        cursor = cursor.data;
    }

    return cursor as T;
};
