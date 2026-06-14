// src/components/DashboardNavbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useNotificationsPolling } from "../utils/useNotificationsPolling";
import {
  Shield,
  Home,
  Bell,
  User,
  Settings,
  Activity,
  LogOut,
  UserCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  FileText,
  TrendingUp,
  Users,
  Globe,
} from "lucide-react";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type NotificationItem = {
  _id?: string;
  id?: string | number;
  title?: string;
  message?: string;
  severity?: "low" | "medium" | "high" | "critical" | string;
  read?: boolean;
  created_at?: string;
};

export interface DashboardNavbarProps {
  userRole: "admin" | "user";
  notificationCount?: number;
  notifications?: NotificationItem[];
  onMarkAllRead?: () => void;
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

/**
 * ✅ TS-safe key generator for notifications coming from:
 * - props: NotificationItem (has id/_id)
 * - hook: HwacsNotification (may have different id fields)
 */
function getNotificationKey(n: unknown, index: number) {
  const x = n as any;
  return (
    x?._id ??
    x?.id ??
    x?.notification_id ??
    x?.uuid ??
    `${x?.created_at ?? "t"}-${index}`
  );
}

export function DashboardNavbar({
  userRole,
  notificationCount,
  notifications = [],
  onMarkAllRead,
}: DashboardNavbarProps) {
  const navigate = useNavigate();

  // ✅ Hook call (fixes "declared but never used" + enables live polling)
  const {
    notifications: polledNotifications,
    unreadCount,
    markAllRead,
  } = useNotificationsPolling(3000);

  // ✅ Prefer props if provided, else use polling data
  const finalNotifications: any[] =
    notifications?.length ? notifications : (polledNotifications as any[]) ?? [];

  const finalUnreadCount =
  typeof notificationCount === "number"
    ? notificationCount
    : (unreadCount ?? 0);

  const finalMarkAllRead = onMarkAllRead ?? markAllRead;

  const handleLogout = () => {
    navigate("/login");
  };

  const profilePath = userRole === "admin" ? "/admin-profile" : "/profile";
  const dashboardPath =
    userRole === "admin" ? "/admin-dashboard" : "/user-dashboard";

  const getNotificationIcon = (sev?: string) => {
    const s = (sev || "").toLowerCase();
    if (s === "critical") return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (s === "high") return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    if (s === "medium") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <Info className="w-4 h-4 text-primary" />;
  };

  return (
    <nav className="border-b-2 border-primary/20 bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left Brand */}
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">
            HWACS Dashboard
          </span>
          <Badge variant="outline" className="ml-2">
            {userRole === "admin" ? "Admin" : "User"}
          </Badge>
        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-6">
          <Link
            to={dashboardPath}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            to={`/${userRole}-vulnerabilities`}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Vulnerabilities</span>
          </Link>

          <Link
            to={`/${userRole}-logs`}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Logs</span>
          </Link>

          <Link
            to={`/${userRole}-traffic`}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Traffic</span>
          </Link>

          {userRole === "admin" ? (
            <Link
              to="/admin-honeypot-management"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>Honeypot Management</span>
            </Link>
          ) : (
            <Link
              to="/user-external-honeypot"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>External Honeypot</span>
            </Link>
          )}

          {userRole === "admin" && (
            <Link
              to="/admin-panel"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors relative">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>

                {finalUnreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {finalUnreadCount}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-96 p-0 bg-white border-2 border-primary/20"
              align="end"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <Badge variant="secondary">{finalUnreadCount} new</Badge>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="p-2">
                  {finalNotifications.length ? (
                    finalNotifications.map((n, i) => {
                      const key = String(getNotificationKey(n, i));
                      const sev = (n as any)?.severity;
                      const title = (n as any)?.title || "New alert";
                      const message = (n as any)?.message || "";
                      const createdAt = (n as any)?.created_at;
                      const isUnread = (n as any)?.read === false;

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                            isUnread
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(sev)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
<p className="font-medium text-sm truncate" style={{ color: "#0f172a" }}>
                                  {title}
                                </p>
                                {isUnread && (
                                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                              </div>

                              <p className="text-sm line-clamp-2"   style={{ color: "#475569" }}
>
                                {message}
                              </p>
                              <p className="text-xs mt-1"  style={{ color: "#64748b" }}>
                                {timeAgo(createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => finalMarkAllRead?.()}
                >
                  Mark all as read
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-white border-2 border-primary/20"
            >
              <DropdownMenuLabel className="text-foreground">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => navigate(profilePath)}
                className="cursor-pointer"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate(`${profilePath}?tab=security`)}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Security Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate(`${profilePath}?tab=activity`)}
                className="cursor-pointer"
              >
                <Activity className="mr-2 h-4 w-4" />
                <span>Activity Log</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

