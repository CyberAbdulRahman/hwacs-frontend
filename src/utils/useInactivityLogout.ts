import { useEffect } from "react";
import { clearAuth } from "./auth";
import { toast } from "sonner";

//const INACTIVITY_LIMIT = 10 * 1000; // testing
 const INACTIVITY_LIMIT = 5 * 60 * 1000; // final

export function useInactivityLogout() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

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

    const logoutUser = () => {
      const token = sessionStorage.getItem("token");
      const role = sessionStorage.getItem("role");

      if (!token || isPublicPage()) return;

      toast.error("Session expired", {
        description: "You were logged out due to inactivity.",
        duration: 2000,
      });

      setTimeout(() => {
        clearAuth();
        sessionStorage.clear();

        if (role === "admin") {
          window.location.href = "/#/admin-login";
        } else {
          window.location.href = "/#/login";
        }
      }, 1800);
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logoutUser, INACTIVITY_LIMIT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
}