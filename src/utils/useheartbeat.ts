import { useEffect } from "react";
import { api } from "./api";

export function useHeartbeat() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      const token = sessionStorage.getItem("token");
      const role = (sessionStorage.getItem("role") || "").toLowerCase();

      if (!token || role !== "user") return;

      try {
        await api.post("/api/auth/heartbeat");
      } catch {
        // ignore heartbeat errors
      }
    };

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 10000);

    return () => clearInterval(interval);
  }, []);
}