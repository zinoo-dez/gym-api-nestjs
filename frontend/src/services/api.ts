/// <reference types="vite/client" />
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

import type { ApiEnvelope, ApiPaginatedResponse } from "./api.types";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    },
);

/**
 * Fetches all pages from a paginated endpoint and returns the flattened array.
 * Re-usable across all services — import from here instead of duplicating.
 */
export const getAllPages = async <T>(
    path: string,
    params?: Record<string, string | number | undefined>,
): Promise<T[]> => {
    let page = 1;
    let totalPages = 1;
    const results: T[] = [];

    do {
        const response = await api.get<ApiEnvelope<ApiPaginatedResponse<T>>>(path, {
            params: { ...params, page, limit: 100 },
        });

        const payload = response.data.data;
        results.push(...payload.data);
        totalPages = Math.max(payload.totalPages ?? 1, 1);
        page += 1;
    } while (page <= totalPages);

    return results;
};

/** Re-exported so services don't need to import axios directly. */
export const { isAxiosError } = axios;

export default api;
