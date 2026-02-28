/**
 * Shared API response types used across all service files.
 * Import from here instead of re-declaring locally in each service.
 */

/** Standard single-resource envelope: { data: T } */
export interface ApiEnvelope<T> {
  data: T;
}

/** Standard paginated list envelope */
export interface ApiPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
