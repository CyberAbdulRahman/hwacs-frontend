import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "./api";

export type HwacsNotification = {
  _id: string;
  title: string;
  message: string;
  severity?: string;
  read?: boolean;
  created_at?: string;
};

export function useNotificationsPolling(pollMs: number = 5000) {
  const [notifications, setNotifications] = useState<HwacsNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const lastSeenIdRef = useRef<string | null>(null);

  async function fetchNotifications() {
    try {
      const res = await api.get("/api/notifications?limit=10");

      const list: HwacsNotification[] = res.data?.notifications || [];
      setNotifications(list);
      setUnreadCount(res.data?.unread_count || 0);

      const newest = list?.[0]?._id;

      if (newest && lastSeenIdRef.current && newest !== lastSeenIdRef.current) {
        toast(list[0]?.title || "New notification", {
          description: list[0]?.message || "",
        });
      }

      if (newest) {
        lastSeenIdRef.current = newest;
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("Notification polling failed:", error);
      }
    }
  }

  async function markAllRead() {
    try {
      await api.post("/api/notifications/mark-all-read");
      await fetchNotifications();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("Mark all read failed:", error);
        toast.error("Failed to mark notifications as read");
      }
    }
  }

  async function markOneRead(notificationId: string) {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("Mark read failed:", error);
        toast.error("Failed to mark notification as read");
      }
    }
  }

  useEffect(() => {
    fetchNotifications();

    const t = setInterval(() => {
      fetchNotifications();
    }, pollMs);

    return () => clearInterval(t);
  }, [pollMs]);

  return {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
    refreshNotifications: fetchNotifications,
  };
}
