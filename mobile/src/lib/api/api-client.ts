import axios, { AxiosHeaders } from "axios";

import { API_URL } from "@/constants/env";
import {
  clearAuthSession,
  getAccessToken,
} from "@/lib/storage/auth-storage";
import { useAuthStore } from "@/store/auth.store";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAuthSession();
      useAuthStore.getState().setLoggedOut();
    }

    return Promise.reject(error);
  },
);
