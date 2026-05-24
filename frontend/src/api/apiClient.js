import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

export default apiClient;
