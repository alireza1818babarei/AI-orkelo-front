import axios from "axios";
import { getToken } from "../utils/tokenStorage";

// NOTE : API configuration for project.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    const isFormData =
      typeof FormData !== "undefined" && config?.data instanceof FormData;
    if (isFormData && config.headers) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Content-Type", undefined);
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const normalized = {
      status: error?.response?.status ?? 0,
      message:
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        "Unknown Error",
    };
    return Promise.reject(normalized);
  }
);

export default api;
