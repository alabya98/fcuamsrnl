import axios from "axios";
import AuthService from "./AuthService";

const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds — adjust as needed

const AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

AxiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken() || localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    console.error("Error in request setup:", error);
    return Promise.reject(error);
  }
);

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("Unauthorized - redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else if (error.response.status !== 422) {
        console.error("Unexpected response error:", error.response);
      }
    } else if (error.request) {
      console.error("No response received from server:", error.message);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export const cachedGet = async (url: string, ttlMs = CACHE_TTL_MS) => {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }
  const response = await AxiosInstance.get(url);
  cache.set(url, { data: response, expiresAt: now + ttlMs });
  return response;
};

export const invalidateCache = (url: string) => {
  cache.delete(url);
};

export const invalidateCachePrefix = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

export default AxiosInstance;