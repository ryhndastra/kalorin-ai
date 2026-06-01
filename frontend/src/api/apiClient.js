import axios from "axios";
import { auth } from "../config/firebase";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  const appLanguage = localStorage.getItem("app_language") || "id";

  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Accept-Language"] = appLanguage;
  config.headers["X-App-Language"] = appLanguage;

  return config;
});

export default apiClient;
