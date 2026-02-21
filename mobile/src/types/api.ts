export interface ApiResponseEnvelope<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export function isApiResponseEnvelope<T>(
  payload: T | ApiResponseEnvelope<T>,
): payload is ApiResponseEnvelope<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    "statusCode" in payload
  );
}

export function unwrapApiData<T>(
  payload: T | ApiResponseEnvelope<T>,
): T {
  if (isApiResponseEnvelope(payload)) {
    return payload.data;
  }

  return payload;
}
