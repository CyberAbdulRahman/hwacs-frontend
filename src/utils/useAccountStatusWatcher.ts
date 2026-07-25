import { useEffect } from "react";
import { toast } from "sonner";
import { clearAuth } from "./auth";
import { api } from "./api";

const CHECK_INTERVAL = 10 * 1000; // 10 seconds

export function useAccountStatusWatcher() {
  useEffect(() => {
    const publicHashes = [
      "#/login",
      "#/signup",
      "#/admin-login",
      "#/admin-signup",
      "#/otp-verification",
      "#/admin-otp-verification",
      "#/admin-activate",
      "#/reset-password",
    ];

    const isPublicPage = () => {
      const currentHash = window.location.hash;
      return publicHashes.some((path) => currentHash.startsWith(path));
    };

    const checkStatus = async () => {
      const token = sessionStorage.getItem("token");
      const role = sessionStorage.getItem("role");

      // Only check normal user accounts, not admin
      if (!token || role !== "user" || isPublicPage()) {
        return;
      }

      try {
        await api.get("/api/auth/me/status");
      } catch (error: any) {
        const status = error?.response?.data?.status;
        const message = error?.response?.data?.message;

        if (status === "blocked" || status === "suspended") {
          toast.error(
            status === "blocked" ? "Account blocked" : "Account suspended",
            {
              description: message || "Your session has been ended by admin.",
              duration: 2500,
            }
          );

          setTimeout(() => {
            clearAuth();
            sessionStorage.clear();
            window.location.href = "/#/login";
          }, 2200);
        }
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);
}