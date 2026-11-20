import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || "");
    const isLogin = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isLogin) {
      window.dispatchEvent(new Event("nestfind:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  return response.data.data;
}

export default api;
