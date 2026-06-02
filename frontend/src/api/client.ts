import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ??
      error.response?.data?.non_field_errors?.[0] ??
      "Ocorreu um erro inesperado.";
    return Promise.reject(new Error(message));
  }
);

export default api;
