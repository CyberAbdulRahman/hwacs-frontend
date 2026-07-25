import axios from "axios";
import { getToken } from "./auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://hwacs-backend.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
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

    return config;
  },
  (error) => Promise.reject(error)
);

let accountLogoutTriggered = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error?.response?.status;
    const data = error?.response?.data;

    const message =
      data?.message ||
      data?.error ||
      "";

    const role = sessionStorage.getItem("role");

    const isAccountBlockedOrSuspended =
      statusCode === 403 &&
      role === "user" &&
      (
        message.toLowerCase().includes("blocked") ||
        message.toLowerCase().includes("suspended") ||
        message.toLowerCase().includes("account")
      );

    if (isAccountBlockedOrSuspended && !accountLogoutTriggered) {
      accountLogoutTriggered = true;

      const finalMessage = message.toLowerCase().includes("blocked")
        ? "Your account has been blocked by admin."
        : "Your account has been suspended by admin.";

      window.dispatchEvent(
        new CustomEvent("hwacs-account-disabled", {
          detail: {
            message: finalMessage,
          },
        })
      );
    }

    return Promise.reject(error);
  }
);