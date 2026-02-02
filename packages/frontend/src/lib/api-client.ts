import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for authenticated routes (401 with token present)
    if (error.response?.status === 401 && localStorage.getItem("accessToken")) {
      // Clear token and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);
