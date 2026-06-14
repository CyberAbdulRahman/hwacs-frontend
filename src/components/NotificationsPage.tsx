import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Bell, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useNotificationsPolling } from "../utils/useNotificationsPolling";

interface NotificationsPageProps {
  userRole: "admin" | "user";
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function NotificationsPage({ userRole }: NotificationsPageProps) {
  const {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
  } = useNotificationsPolling(5000);

  const getNotificationIcon = (severity?: string) => {
    const s = (severity || "").toLowerCase();

    if (s === "critical") {
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    }

    if (s === "high" || s === "warning") {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }

    return <Info className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole={userRole} />

      <main className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Your attack alerts and activity updates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {unreadCount} unread
            </Badge>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-4 bg-card/80 backdrop-blur transition-all hover:shadow-md ${
                notification.read === false ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getNotificationIcon(notification.severity)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold" style={{ color: "#0f172a" }}>{notification.title}</h3>
                    {notification.read === false && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-sm mb-2 break-words" style={{ color: "#475569" }}>
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(notification.created_at)}
                    </span>

                    <Badge variant="outline" className="text-xs">
                      {(notification.severity || "info").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {notification.read === false && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markOneRead(notification._id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <Card className="p-12 bg-card/80 backdrop-blur text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications to display</p>
          </Card>
        )}
      </main>
    </div>
  );
}
